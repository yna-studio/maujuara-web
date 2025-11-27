<script lang="ts">
    import { onMount } from "svelte";
    import { browser } from "$app/environment";
    import { OrganizersAPI } from "$lib/api/organizers";
    import OrganizerCard from "$lib/components/OrganizerCard.svelte";
    import Spinner from "$lib/components/Spinner.svelte";
    import FullWidthMessage from "$lib/components/FullWidthMessage.svelte";
    import Subtitle from "$lib/components/Subtitle.svelte";

    // Type definitions
    interface Organizer {
        id: string;
        name: string;
        avatar?: string;
    }

    // Data states
    let organizers: Organizer[] = [];
    let loading = browser; // Only show loading state in browser
    let error: string | null = null;

    // Fetch organizers on mount (browser only)
    onMount(async () => {
        if (!browser) return;
        
        await fetchOrganizers();
    });

    async function fetchOrganizers() {
        try {
            loading = true;
            error = null;
            
            // Get all organizers ordered by updated_at
            const response = await OrganizersAPI.getOrganizersWithLimit(100, 'updated_at');
            organizers = response.data.map(org => ({
                id: org._id,
                name: org.name,
                avatar: org.avatar || org.image
            }));
            
        } catch (err) {
            console.error('Failed to fetch organizers:', err);
            error = 'Gagal memuat data penyelenggara';
        } finally {
            loading = false;
        }
    }
</script>

<main class="max-w-5xl mx-auto px-4 py-8">
    <Subtitle
        text="Penyelenggara"
        subtext="Temukan berbagai penyelenggara kompetisi terpercaya di Indonesia"
    />

    <!-- Loading State -->
    {#if loading}
        <div class="flex justify-center py-16">
            <Spinner size="large" color="primary" />
        </div>
    {:else if error}
        <div class="py-16">
            <FullWidthMessage
                text="Gagal Memuat Penyelenggara"
                subtext={error}
            />
        </div>
    {:else if organizers.length === 0}
        <div class="py-16">
            <FullWidthMessage
                text="Tidak Ada Penyelenggara"
                subtext="Belum ada penyelenggara kompetisi yang tersedia saat ini."
            />
        </div>
    {:else}
        <!-- Organizers Grid - 5 columns -->
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 mt-8">
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
    {/if}
</main>
