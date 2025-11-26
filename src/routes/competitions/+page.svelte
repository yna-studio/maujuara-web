<script lang="ts">
    import { onMount } from "svelte";
    import CompetitionCard from "$lib/components/CompetitionCard.svelte";
    import Subtitle from "$lib/components/Subtitle.svelte";
    import Button from "$lib/components/Button.svelte";
    import FullWidthMessage from "$lib/components/FullWidthMessage.svelte";
    import Spinner from "$lib/components/Spinner.svelte";

    // Sample data - replace with your actual data source
    const competitions = [
        {
            id: "1",
            poster: "🎨",
            title: "Lomba Desain Grafis Digital 2025",
            endDate: "15 Desember 2025",
            organizer: "Kreatif Indonesia",
            prize: "Rp 25.000.000",
            category: "Desain",
            status: "progress",
        },
        {
            id: "2",
            poster: "📸",
            title: "Kompetisi Fotografi Landscape",
            endDate: "20 Desember 2025",
            organizer: "Fotografi Nusantara",
            prize: "Rp 15.000.000",
            category: "Fotografi",
            status: "progress",
        },
        // Add 7 more sample competitions
        {
            id: "3",
            poster: "💻",
            title: "Hackathon Nasional 2025",
            endDate: "10 Januari 2026",
            organizer: "Tech Indonesia",
            prize: "Rp 50.000.000",
            category: "Teknologi",
            status: "progress",
        },
        {
            id: "4",
            poster: "🎭",
            title: "Lomba Teater Remaja",
            endDate: "5 Desember 2025",
            organizer: "Seni Budaya Nusantara",
            prize: "Rp 10.000.000",
            category: "Seni Pertunjukan",
            status: "progress",
        },
        {
            id: "5",
            poster: "✏️",
            title: "Lomba Menulis Cerpen",
            endDate: "30 November 2025",
            organizer: "Sastra Indonesia",
            prize: "Rp 8.000.000",
            category: "Menulis",
            status: "progress",
        },
        {
            id: "6",
            poster: "🎵",
            title: "Kompetisi Musik Tradisional",
            endDate: "15 Januari 2026",
            organizer: "Kementerian Pendidikan",
            prize: "Rp 30.000.000",
            category: "Musik",
            status: "progress",
        },
        {
            id: "7",
            poster: "🎮",
            title: "Turnamen E-Sport Mobile Legends",
            endDate: "20 Januari 2026",
            organizer: "GameOn Indonesia",
            prize: "Rp 75.000.000",
            category: "E-Sport",
            status: "progress",
        },
        {
            id: "8",
            poster: "🍳",
            title: "Lomba Masak Nusantara",
            endDate: "10 Desember 2025",
            organizer: "Kuliner Indonesia",
            prize: "Rp 20.000.000",
            category: "Kuliner",
            status: "progress",
        },
        {
            id: "9",
            poster: "📱",
            title: "Aplikasi Inovasi Digital",
            endDate: "25 Desember 2025",
            organizer: "Kominfo",
            prize: "Rp 100.000.000",
            category: "Teknologi",
            status: "progress",
        },
    ];

    // Filter states
    let selectedCategory = "";
    let selectedOrganizer = "";
    let selectedStatus = "";
    let showMobileFilters = false;

    // Get unique values for filters
    const categories = [...new Set(competitions.map((c) => c.category))];
    const organizers = [...new Set(competitions.map((c) => c.organizer))];
    const statuses = ["Open", "Berlangsung", "Berakhir"];

    // Filtered competitions
    $: filteredCompetitions = competitions.filter((comp) => {
        let matches = true;
        if (selectedCategory)
            matches = matches && comp.category === selectedCategory;
        if (selectedOrganizer)
            matches = matches && comp.organizer === selectedOrganizer;
        if (selectedStatus) {
            if (selectedStatus === "Open")
                matches = matches && comp.status === "progress";
            else if (selectedStatus === "Berlangsung")
                matches = matches && comp.status === "closed";
            else if (selectedStatus === "Berakhir")
                matches = matches && comp.status === "ended";
        }
        return matches;
    });

    // Infinite scroll state
    let loading = false;
    let page = 1;
    const itemsPerPage = 9;

    // Handle scroll for infinite loading
    onMount(() => {
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    });

    function handleScroll() {
        if (loading) return;

        const { scrollTop, scrollHeight, clientHeight } =
            document.documentElement;
        if (scrollTop + clientHeight >= scrollHeight - 100) {
            loadMore();
        }
    }

    function loadMore() {
        loading = true;
        // Simulate API call
        setTimeout(() => {
            page++;
            loading = false;
        }, 1000);
    }

    // Reset to first page when filters change
    $: {
        if (selectedCategory || selectedOrganizer || selectedStatus) {
            page = 1;
        }
    }
</script>

<main class="max-w-5xl mx-auto px-4 py-8">
    <Subtitle
        text="Jelajah Lomba"
        subtext="Ikuti beragam lomba disini, gunakan filter untuk menemukan lomba yang paling sesuai"
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
        <h2 class="sr-only">Filter Lomba</h2>
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
                        <option value={category}>{category}</option>
                    {/each}
                </select>
            </div>

            <!-- Organizer Filter -->
            <div>
                <label for="organizer" class="block text-sm font-medium text-gray-700 mb-2">Penyelenggara</label>
                <select 
                    id="organizer"
                    bind:value={selectedOrganizer}
                    class="filter-select w-full sm:w-48 rounded-lg px-4 py-3 bg-gray-50 focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm h-12"
                >
                    <option value="">Semua Penyelenggara</option>
                    {#each organizers as organizer}
                        <option value={organizer}>{organizer}</option>
                    {/each}
                </select>
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
                        <option value={status}>{status}</option>
                    {/each}
                </select>
            </div>
        </div>
        <Button
            className="mt-2 w-full sm:w-auto"
            size="auto"
            variant="small"
            text="Filter"
        />
    </div>

    <!-- Competitions Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {#each filteredCompetitions.slice(0, page * itemsPerPage) as competition}
            <CompetitionCard
                {competition}
                status={competition.status}
                id={competition.id}
            />
        {/each}
    </div>

    <!-- Loading Spinner -->
    <div class="flex justify-center py-8">
        <Spinner size="large" color="primary" />
    </div>

    <!-- No Results -->
    <div class="py-8">
        <FullWidthMessage
            text="Kompetisi tidak ditemukan"
            subtext="Coba ubah filter atau hapus beberapa pilihan untuk melihat kompetisi lainnya."
        />
    </div>
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
