<script lang="ts">
    import { onMount } from "svelte";
    import { browser } from "$app/environment";
    import { goto } from "$app/navigation";
    import { page } from "$app/stores";
    import CompetitionCard from "$lib/components/CompetitionCard.svelte";
    import Subtitle from "$lib/components/Subtitle.svelte";
    import Button from "$lib/components/Button.svelte";
    import FullWidthMessage from "$lib/components/FullWidthMessage.svelte";
    import Spinner from "$lib/components/Spinner.svelte";
    import SearchableSelect from "$lib/components/SearchableSelect.svelte";

    // API imports
    import { CompetitionsAPI } from "$lib/api/competitions";
    import { CategoriesAPI } from "$lib/api/categories";
    import { OrganizersListAPI } from "$lib/api/organizersList";

    // Type definitions
    interface Competition {
        _id: string;
        title: string;
        poster: string;
        deadline_date: string;
        announcement_date: string;
        status: 'open' | 'progress' | 'closed';
        category: {
            id: string;
            name: string;
        };
        organizer: {
            id: string;
            name: string;
            avatar: string;
        };
        prize_desc: string;
        prize_estimate?: number;
        desc: string;
        contacts: Array<{
            type: string;
            value: string;
        }>;
        link_join: string;
        created_date: string;
        updated_date: string;
        views: number;
    }

    interface Category {
        id: string;
        name: string;
    }

    // Data states
    let competitions: Competition[] = [];
    let categories: Category[] = [];
    let organizers: Array<{ id: string; name: string }> = [];
    let loading = browser; // Only show loading state in browser
    let error: string | null = null;

    // Filter states - initialize from URL parameters
    let selectedCategory = '';
    let selectedOrganizer = '';
    let selectedStatus = '';
    let showMobileFilters = false;

    // Filter options
    const statuses = [
        { value: "open", text: "Open" },
        { value: "progress", text: "Berlangsung" },
        { value: "closed", text: "Berakhir" }
    ];

    // Pagination
    let currentPage = 1;
    const itemsPerPage = 9;
    let totalCount = 0;
    let totalPages = 1;

    // Reset to first page when URL parameters change
    $: if ($page.url.searchParams.toString()) {
        currentPage = 1;
        if (browser) {
            fetchCompetitions();
        }
    }

    // Fetch data on mount (browser only)
    onMount(async () => {
        if (!browser) return;
        
        // Initialize filter states from URL parameters
        selectedCategory = $page.url.searchParams.get('category') || '';
        selectedOrganizer = $page.url.searchParams.get('organizer') || '';
        selectedStatus = $page.url.searchParams.get('status') || '';
        
        await Promise.all([
            fetchCategories(),
            fetchOrganizers(),
            fetchCompetitions()
        ]);
    });

    async function fetchCategories() {
        try {
            const response = await CategoriesAPI.getCategories();
            categories = response.data;
        } catch (err) {
            console.error('Failed to fetch categories:', err);
        }
    }

    async function fetchOrganizers() {
        try {
            const response = await OrganizersListAPI.getAllOrganizers();
            organizers = response.data.map(org => ({
                id: org.id,
                name: org.name
            }));
        } catch (err) {
            console.error('Failed to fetch organizers:', err);
        }
    }

    async function fetchCompetitions() {
        try {
            loading = true;
            const params: Record<string, any> = {
                limit: itemsPerPage,
                page: currentPage
            };

            // Use URL parameters for filtering
            const urlParams = new URLSearchParams($page.url.searchParams);
            if (urlParams.get('category')) params.id_category = urlParams.get('category');
            if (urlParams.get('organizer')) params.id_organizer = urlParams.get('organizer');
            if (urlParams.get('status')) params.status = urlParams.get('status');

            const response = await CompetitionsAPI.getCompetitions(params);
            competitions = response.data;
            totalCount = response.meta?.totalCount || 0;
            totalPages = response.meta?.totalPages || 1;
        } catch (err) {
            console.error('Failed to fetch competitions:', err);
            error = 'Gagal memuat kompetisi';
        } finally {
            loading = false;
        }
    }

    // Filter redirect function
    function applyFilters() {
        const urlParams = new URLSearchParams();
        
        if (selectedCategory) {
            urlParams.set('category', selectedCategory);
        }
        
        if (selectedOrganizer) {
            urlParams.set('organizer', selectedOrganizer);
            // Add organizer name for display
            const organizer = organizers.find(org => org.id === selectedOrganizer);
            if (organizer) {
                urlParams.set('organizer_name', organizer.name);
            }
        }
        
        if (selectedStatus) {
            urlParams.set('status', selectedStatus);
        }
        
        // Build new URL
        const newUrl = urlParams.toString() ? `/competitions?${urlParams.toString()}` : '/competitions';
        
        // Redirect
        goto(newUrl);
    }

    // Reset to first page when filters change (handled by URL params)
    // Removed reactive statement since we're using URL-based filtering

    // Load more function for pagination
    async function loadMore() {
        if (loading || currentPage >= totalPages) return;
        
        currentPage++;
        await fetchCompetitions();
    }

    // Handle scroll for infinite loading
    function handleScroll() {
        if (!browser || loading || currentPage >= totalPages) return;

        const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
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
    <Subtitle
        text="Jelajah Kompetisi"
        subtext="Ikuti beragam kompetisi disini, gunakan filter untuk menemukan kompetisi yang paling sesuai"
    />

    <!-- Mobile Filter Toggle -->
    <div class="sm:hidden mb-4">
        <button
            type="button"
            class="w-full inline-flex items-center justify-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
            on:click={() => (showMobileFilters = !showMobileFilters)}
        >
            <span>{showMobileFilters ? 'Sembunyikan Filter' : 'Tampilkan Filter'}</span>
        </button>
    </div>

    <!-- Filters -->
    <div
        class={`mb-8 pb-6 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${showMobileFilters ? '' : 'hidden sm:flex'}`}
    >
        <h2 class="sr-only">Filter Kompetisi</h2>
        <div class="flex-1 flex flex-col sm:flex-row gap-4 w-full">
            <!-- Category Filter -->
            <div>
                <label for="category" class="block text-sm font-medium text-gray-700 mb-2">Kategori</label>
                <select 
                    id="category"
                    bind:value={selectedCategory}
                    class="filter-select w-full sm:w-48 rounded-lg px-4 py-3 bg-gray-50 focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm h-12"
                >
                    <option value="">Semua Kategori</option>
                    {#each categories as category}
                        <option value={category.id}>{category.name}</option>
                    {/each}
                </select>
            </div>

            <!-- Organizer Filter -->
            <div>
                <label for="organizer" class="block text-sm font-medium text-gray-700 mb-2">Penyelenggara</label>
                <SearchableSelect
                    id="organizer"
                    bind:value={selectedOrganizer}
                    options={organizers}
                    placeholder="Cari penyelenggara..."
                />
            </div>

            <!-- Status Filter -->
            <div>
                <label for="status" class="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select 
                    id="status"
                    bind:value={selectedStatus}
                    class="filter-select w-full sm:w-48 rounded-lg px-4 py-3 bg-gray-50 focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm h-12"
                >
                    <option value="">Semua Status</option>
                    {#each statuses as status}
                        <option value={status.value}>{status.text}</option>
                    {/each}
                </select>
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

    <!-- Competitions Grid -->
    {#if loading && competitions.length === 0}
        <div class="flex justify-center py-8">
            <Spinner size="large" color="primary" />
        </div>
    {:else if error}
        <div class="py-8">
            <FullWidthMessage
                text="Gagal memuat kompetisi"
                subtext={error}
            />
        </div>
    {:else if competitions.length === 0}
        <div class="py-8">
            <FullWidthMessage
                text="Kompetisi tidak ditemukan"
                subtext="Coba ubah filter atau hapus beberapa pilihan untuk melihat kompetisi lainnya."
            />
        </div>
    {:else}
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {#each competitions as competition}
                <CompetitionCard
                    {competition}
                    status={competition.status === 'open' ? 'progress' : competition.status}
                />
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

<style>
    /* Add any custom styles here */
    .filter-select {
        /* Remove native arrow so we can fully control caret */
        appearance: none;
        -webkit-appearance: none;
        -moz-appearance: none;

        /* Space for custom caret */
        padding-right: 2.25rem;

        /* Custom caret icon, centered vertically and close to the right */
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke-width='2' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7' /%3E%3C/svg%3E");
        background-position: right 0.6rem center;
        background-repeat: no-repeat;
        background-size: 1rem 1rem;
    }
</style>
