<script lang="ts">
    import { onMount } from "svelte";
    import { browser } from "$app/environment";
    import Subtitle from "$lib/components/Subtitle.svelte";
    import Button from "$lib/components/Button.svelte";
    import FullWidthMessage from "$lib/components/FullWidthMessage.svelte";
    import Spinner from "$lib/components/Spinner.svelte";
    import NewsCard from "$lib/components/NewsCard.svelte";

    // API imports
    import { NewsAPI } from "$lib/api/news";

    // Type definitions
    interface News {
        _id: string;
        title: string;
        thumbnail: string;
        created_at: string;
        createdBy?: {
            id: string;
            name: string;
            avatar: string;
        };
        created_by: string;
        short_desc: string;
        description: string;
        shortDesc: string;
        tags: string[];
    }

    // Data states
    let news: News[] = [];
    let loading = browser; // Only show loading state in browser
    let error: string | null = null;

    // Pagination
    let currentPage = 1;
    const itemsPerPage = 9;
    let totalCount = 0;
    let totalPages = 1;

    // Fetch data on mount (browser only)
    onMount(async () => {
        if (!browser) return;

        await fetchNews();
    });

    async function fetchNews() {
        try {
            loading = true;
            
            const response = await NewsAPI.getNewsWithPagination(currentPage, itemsPerPage);
            
            if (currentPage === 1) {
                news = response.data;
            } else {
                news = [...news, ...response.data];
            }
            
            totalCount = response.meta.totalCount;
            totalPages = response.meta.totalPages;
        } catch (err) {
            console.error("Failed to fetch news:", err);
            error = "Gagal memuat berita";
        } finally {
            loading = false;
        }
    }

    // Load more function for pagination
    async function loadMore() {
        if (loading || currentPage >= totalPages) return;

        currentPage++;
        await fetchNews();
    }

    // Handle scroll for infinite loading
    function handleScroll() {
        if (!browser || loading || currentPage >= totalPages) return;

        const { scrollTop, scrollHeight, clientHeight } =
            document.documentElement;
        if (scrollTop + clientHeight >= scrollHeight - 100) {
            loadMore();
        }
    }

    // Add scroll listener (browser only)
    onMount(() => {
        if (!browser) return;

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    });
</script>

<main class="max-w-5xl mx-auto px-4 py-8">
    <Subtitle text="Berita MauJuara">
        <p class="text-sm text-gray-600">
            Update kabar berita terbaru dari MauJuara
            <br />
            <!-- News Count Info -->
            {#if !loading && totalCount > 0}
                Menampilkan <span class="font-semibold text-gray-900"
                    >{news.length}</span
                >
                berita dari total
                <span class="font-semibold text-gray-900">{totalCount}</span> berita tersedia
            {/if}
        </p>
    </Subtitle>

    <!-- News Grid -->
    {#if loading && news.length === 0}
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {#each Array(9) as _}
                <div class="bg-gray-100 rounded-xl p-6 animate-pulse">
                    <div class="h-8 bg-gray-200 rounded mb-4"></div>
                    <div class="h-4 bg-gray-200 rounded mb-2"></div>
                    <div class="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
            {/each}
        </div>
    {:else if error}
        <div class="py-8">
            <FullWidthMessage text="Gagal memuat berita" subtext={error} />
        </div>
    {:else if news.length === 0}
        <div class="py-8">
            <FullWidthMessage
                text="Berita tidak ditemukan"
                subtext="Tidak ada berita tersedia saat ini. Coba kembali lagi nanti."
            />
        </div>
    {:else}
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {#each news as newsItem}
                <NewsCard news={newsItem} />
            {/each}
        </div>

        <!-- Load More Button / Loading -->
        {#if loading}
            <div class="flex justify-center py-8">
                <Spinner size="large" color="primary" />
            </div>
        {:else if currentPage < totalPages}
            <div class="flex justify-center py-8">
                <Button
                    text="Muat Lebih Banyak"
                    on:click={loadMore}
                    variant="large"
                />
            </div>
        {/if}
    {/if}
</main>
