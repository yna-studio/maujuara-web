<script lang="ts">
    import { onMount } from "svelte";
    import { browser } from "$app/environment";
    import { goto } from "$app/navigation";
    import { page } from "$app/stores";
    import { OrganizersAPI } from "$lib/api/organizers";
    import OrganizerCard from "$lib/components/OrganizerCard.svelte";
    import Spinner from "$lib/components/Spinner.svelte";
    import FullWidthMessage from "$lib/components/FullWidthMessage.svelte";
    import Subtitle from "$lib/components/Subtitle.svelte";
    import Button from "$lib/components/Button.svelte";

    // Type definitions
    interface Organizer {
        id: string;
        name: string;
        avatar?: string;
    }

    // Data states
    let organizers: Organizer[] = [];
    let initialLoading = browser; // Only show loading state in browser
    let loadingMore = false; // Loading state for pagination
    let error: string | null = null;
    let hasReceivedResponse = false; // Track if we've gotten a response from API
    
    // Filter states
    let searchName = "";
    let showMobileFilters = false;
    
    // Pagination
    let currentPage = 1;
    const itemsPerPage = 15;
    let totalCount = 0;
    let totalPages = 1;
    let hasNextPage = false;
    
    // Reset to first page and refetch whenever URL search params change
    let lastSearchParams = "";

    $: {
        const currentSearch = $page.url.searchParams.toString();
        if (currentSearch !== lastSearchParams) {
            lastSearchParams = currentSearch;
            currentPage = 1;
            if (browser) {
                fetchOrganizers(true);
            }
        }
    }

    // Filter redirect function
    function applyFilters() {
        const urlParams = new URLSearchParams();

        if (searchName.trim()) {
            urlParams.set("search", searchName.trim());
        }

        // Build new URL
        const newUrl = urlParams.toString()
            ? `/organizers?${urlParams.toString()}`
            : "/organizers";

        // Redirect
        goto(newUrl);
    }

    // Load more function for pagination
    async function loadMore() {
        if (loadingMore || !hasNextPage) return;

        currentPage++;
        loadingMore = true;
        await fetchOrganizers();
    }

    // Handle scroll for infinite loading
    function handleScroll() {
        if (!browser || initialLoading || loadingMore || !hasNextPage) return;

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

    // Fetch organizers on mount (browser only)
    onMount(async () => {
        if (!browser) return;
        
        // Initialize filter states from URL parameters
        searchName = $page.url.searchParams.get("search") || "";
        
        await fetchOrganizers(true);
    });

    async function fetchOrganizers(reset = false) {
        try {
            if (reset) {
                currentPage = 1;
                organizers = [];
                initialLoading = true;
            }
            
            error = null;
            
            // Get organizers with pagination and search
            const params: Record<string, any> = {
                limit: itemsPerPage,
                page: currentPage,
            };
            
            // Use URL parameters for filtering
            const urlParams = new URLSearchParams($page.url.searchParams);
            if (urlParams.get("search")) {
                params.search = urlParams.get("search");
            }
            
            const response = await OrganizersAPI.getOrganizersWithPagination(itemsPerPage, currentPage, 'updated_at', params.search || undefined);
            
            hasReceivedResponse = true; // Mark that we've received a response
            
            if (currentPage === 1) {
                organizers = response.data.map(org => ({
                    id: org._id,
                    name: org.name,
                    avatar: org.avatar || org.image
                }));
            } else {
                const newOrganizers = response.data.map(org => ({
                    id: org._id,
                    name: org.name,
                    avatar: org.avatar || org.image
                }));
                organizers = [...organizers, ...newOrganizers];
            }
            
            totalCount = response.meta?.totalCount || 0;
            totalPages = response.meta?.totalPages || 1;
            hasNextPage = response.meta?.hasNextPage || false;
            
        } catch (err) {
            console.error('Failed to fetch organizers:', err);
            error = 'Gagal memuat data penyelenggara';
        } finally {
            initialLoading = false;
            loadingMore = false;
        }
    }
</script>

<main class="max-w-5xl mx-auto px-4 py-8">
    <Subtitle
        text="Penyelenggara"
        subtext="Temukan berbagai penyelenggara kompetisi terpercaya di Indonesia"
    >
        <p class="text-sm text-gray-600">
            <!-- Organizer Count Info -->
            {#if !initialLoading && totalCount > 0}
                Menampilkan <span class="font-semibold text-gray-900"
                    >{organizers.length}</span
                >
                penyelenggara dari total
                <span class="font-semibold text-gray-900">{totalCount}</span> penyelenggara
                tersedia
            {/if}
        </p>
    </Subtitle>

    <!-- Mobile Filter Toggle -->
    <div class="sm:hidden mb-4">
        <Button
            text="Filter Penyelenggara"
            variant="small"
            color="white"
            size="full"
            on:click={() => (showMobileFilters = !showMobileFilters)}
        />
    </div>

    <!-- Filters -->
    <div
        class={`mb-8 pb-6 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${showMobileFilters ? "" : "hidden sm:flex"}`}
    >
        <h2 class="sr-only">Filter Penyelenggara</h2>
        <div class="flex-1 flex flex-col sm:flex-row gap-4 w-full">
            <!-- Search Filter -->
            <div class="flex-1">
                <label
                    for="search"
                    class="block text-sm font-medium text-gray-700 mb-2"
                    >Cari Penyelenggara</label
                >
                <input
                    type="text"
                    id="search"
                    bind:value={searchName}
                    placeholder="Masukkan nama penyelenggara..."
                    class="w-full sm:w-64 rounded-lg px-4 py-3 bg-gray-50 focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm h-12 border border-gray-300"
                    on:keydown={(e) => {
                        if (e.key === 'Enter') {
                            applyFilters();
                        }
                    }}
                />
            </div>
        </div>
        <Button
            className="mt-2 w-full sm:w-auto"
            size="auto"
            variant="small"
            text="Filter"
            on:click={applyFilters}
        />
    </div>

    <!-- Initial Loading State - Skeleton Loader -->
    {#if initialLoading}
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6 mt-8">
            {#each Array(15) as _}
                <div class="bg-gray-100 rounded-xl p-4 animate-pulse">
                    <div class="w-full h-16 bg-gray-200 rounded-lg mb-3"></div>
                    <div class="h-4 bg-gray-200 rounded mb-2"></div>
                    <div class="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
            {/each}
        </div>
    {:else if error}
        <div class="py-16">
            <FullWidthMessage
                text="Gagal Memuat Penyelenggara"
                subtext={error}
            />
        </div>
    {:else if hasReceivedResponse && organizers.length === 0}
        <div class="py-16">
            <FullWidthMessage
                text="Tidak Ada Penyelenggara"
                subtext="Belum ada penyelenggara kompetisi yang tersedia saat ini."
            />
        </div>
    {:else}
        <!-- Organizers Grid - 5 columns -->
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6 mt-8">
            {#each organizers as organizer}
                <OrganizerCard 
                    organizer={{
                        _id: organizer.id,
                        name: organizer.name,
                        avatar: organizer.avatar
                    }}
                />
            {/each}
        </div>

        <!-- Load More Button / Loading -->
        {#if loadingMore}
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6 mt-8">
                {#each Array(5) as _}
                    <div class="bg-gray-100 rounded-xl p-4 animate-pulse">
                        <div class="w-full h-16 bg-gray-200 rounded-lg mb-3"></div>
                        <div class="h-4 bg-gray-200 rounded mb-2"></div>
                        <div class="h-3 bg-gray-200 rounded w-3/4"></div>
                    </div>
                {/each}
            </div>
        {:else if hasNextPage}
            <div class="flex justify-center py-8">
                <Button
                    text="Berikutnya"
                    on:click={loadMore}
                    variant="large"
                />
            </div>
        {/if}
    {/if}
</main>
