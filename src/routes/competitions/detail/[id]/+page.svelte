<script lang="ts">
    import { page } from '$app/stores';
    import { onMount } from 'svelte';
    import Button from '$lib/components/Button.svelte';
    import { showSnackbar } from '$lib/stores/snackbar';

    let competitionId = '';
    let title = '';
    let activeTab: 'regulations' | 'discussions' = 'regulations';
    let showPosterModal = false;
    let showStatusMenu = false;

    // Mocked competition data - replace later with real data from API/DB
    let competition = {
        poster:
            'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiYcW-mfR2gkRFGuZWL-_pR6AccArLGWqQdK_gAbgyTW3kjRc6U_HgTJ5of_wuIDy_eENe2Z1NO4ZJpYh5Kg4ef68MvUxSqcViHq9QFZPeUHw-50OYWcgC9u84a528km83haHOApCNA4n6EUG3dSGPn5Oo1mja_QNQN1_3dj9Skbgs6NWiXpccd-PRXHJ8/s614/lomba%202024.png',
        organizer: 'Kreatif Indonesia',
        organizerId: 'org001',
        status: 'progress', // progress | closed | ended
        createdDate: '1 November 2025',
        deadlineDate: '15 Desember 2025',
        announcementDate: '20 Desember 2025',
        views: 1240,
        applyUrl: 'https://example.com/daftar-kompetisi',
        instagram: 'https://instagram.com/kreatifindonesia',
        facebook: 'https://facebook.com/kreatifindonesia',
        whatsapp: 'https://wa.me/6281234567890',
        shortDesc:
            'Ikuti kompetisi seru dari Kreatif Indonesia! Tunjukkan karya terbaikmu dan menangkan hadiah menarik.',
        contentHtml:
            '<p>Ikuti kompetisi ini untuk menunjukkan kreativitasmu. Kompetisi terbuka untuk pelajar, mahasiswa, dan umum.</p><p>Pastikan membaca ketentuan lomba dengan teliti sebelum mendaftar. Semua karya harus orisinal dan belum pernah dipublikasikan sebelumnya.</p>',
    };

    const slugify = (value: string) =>
        value
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');

    $: organizerDetailPath = `/organizers/detail/${slugify(competition.organizer)}-${competition.organizerId}`;

    $: statusLabel =
        competition.status === 'progress'
            ? 'Open'
            : competition.status === 'closed'
                ? 'Berlangsung'
                : 'Berakhir';

    async function copyInstagramCaption() {
        try {
            const captionTitle = title || 'Competition Detail';
            const captionDesc = competition.shortDesc || '';
            const captionLink = $page.url.href;
            const caption = `${captionTitle}\n\n${captionDesc}\n\n${captionLink}`;
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(caption.trim());
            } else {
                console.warn('Clipboard API not available, caption not copied automatically.');
            }
            showStatusMenu = false;
            showSnackbar('Caption copied successfully');
        } catch (e) {
            console.error('Failed to copy caption', e);
            // Still show snackbar so user sees feedback
            showStatusMenu = false;
            showSnackbar('Failed to copy caption');
        }
    }

    onMount(() => {
        // Get the ID from the URL
        const pathSegments = $page.url.pathname.split('/');
        const idWithTitle = pathSegments[pathSegments.length - 1];

        // Extract the ID (last segment after last dash)
        const lastDashIndex = idWithTitle.lastIndexOf('-');
        if (lastDashIndex !== -1) {
            competitionId = idWithTitle.substring(lastDashIndex + 1);
            title = idWithTitle.substring(0, lastDashIndex).replace(/-/g, ' ');
        } else {
            competitionId = idWithTitle;
        }
    });
</script>

<main class="max-w-5xl mx-auto px-4 py-8">
    <h1 class="text-3xl sm:text-4xl font-bold text-gray-900 mb-6 capitalize">
        {title || 'Competition Detail'}
    </h1>

    <div class="flex flex-col lg:flex-row gap-8">
        <!-- Poster -->
        <div class="w-full lg:w-1/2 lg:sticky lg:top-6 lg:self-start">
            <button
                type="button"
                class="w-full overflow-hidden rounded-xl bg-gray-100 max-h-screen focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                on:click={() => (showPosterModal = true)}
                aria-label="Perbesar poster kompetisi"
            >
                <img
                    src={competition.poster}
                    alt={title || 'Competition poster'}
                    class="w-full h-full object-cover cursor-zoom-in"
                />
            </button>
        </div>

        <!-- Meta, Hadiah, Content & Button (in tabs) -->
        <div class="w-full lg:w-1/2 space-y-6">
            <!-- Status + Actions -->
            <div class="flex items-center justify-between gap-3">
                <div class="inline-flex items-center px-3 py-1.5 rounded-full bg-green-50 text-xs sm:text-sm font-semibold text-green-700 border border-green-200">
                    <span class="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                    <span>{statusLabel}</span>
                </div>
                <div class="relative">
                    <button
                        type="button"
                        class="inline-flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 hover:text-gray-700 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                        on:click={() => (showStatusMenu = !showStatusMenu)}
                        aria-label="Opsi kompetisi"
                    >
                        <span class="inline-block leading-none">•••</span>
                    </button>
                    {#if showStatusMenu}
                        <div
                            class="absolute right-0 mt-2 w-44 rounded-md bg-white shadow-lg ring-1 ring-black/5 z-10 text-xs sm:text-sm"
                        >
                            <button
                                type="button"
                                class="w-full px-3 py-2 text-left hover:bg-gray-50"
                                on:click={copyInstagramCaption}
                            >
                                Copy Instagram caption
                            </button>
                            <a
                                href={organizerDetailPath}
                                class="block px-3 py-2 hover:bg-gray-50"
                                on:click={() => (showStatusMenu = false)}
                            >
                                Go To Organizer
                            </a>
                        </div>
                    {/if}
                </div>
            </div>

            <!-- Tabs Header -->
            <div class="border-b border-gray-200 flex gap-4 text-sm mt-2">
                <button
                    type="button"
                    class={`pb-2 border-b-2 transition-colors duration-150 ${
                        activeTab === 'regulations'
                            ? 'border-red-600 text-red-600 font-semibold'
                            : 'border-transparent text-gray-600 hover:text-red-600'
                    }`}
                    on:click={() => (activeTab = 'regulations')}
                >
                    Regulations
                </button>
                <button
                    type="button"
                    class={`pb-2 border-b-2 transition-colors duration-150 ${
                        activeTab === 'discussions'
                            ? 'border-red-600 text-red-600 font-semibold'
                            : 'border-transparent text-gray-600 hover:text-red-600'
                    }`}
                    on:click={() => (activeTab = 'discussions')}
                >
                    Discussions
                </button>
            </div>

            {#if activeTab === 'regulations'}
                <!-- Meta data -->
                <section class="bg-white rounded-xl shadow p-5 space-y-3 text-sm text-gray-700">
                    <div class="flex justify-between">
                        <span class="font-medium text-gray-500">Penyelenggara</span>
                        <a
                            href={organizerDetailPath}
                            class="text-red-600 hover:text-red-700 font-medium transition-colors duration-150"
                        >
                            {competition.organizer}
                        </a>
                    </div>
                    <div class="flex justify-between">
                        <span class="font-medium text-gray-500">Tanggal dibuat</span>
                        <span>{competition.createdDate}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="font-medium text-gray-500">Deadline pendaftaran</span>
                        <span>{competition.deadlineDate}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="font-medium text-gray-500">Pengumuman pemenang</span>
                        <span>{competition.announcementDate}</span>
                    </div>
                    <div class="flex justify-between border-t border-gray-100 pt-3 mt-1">
                        <span class="font-medium text-gray-500">Total views</span>
                        <span>{competition.views.toLocaleString()}x</span>
                    </div>
                </section>

                <!-- Hadiah Section -->
                <section class="bg-white rounded-xl shadow p-5 text-sm leading-relaxed text-gray-800">
                    <h2 class="text-base font-semibold mb-3">Hadiah</h2>
                    <p class="mb-1">Estimasi Total Hadiah Rp : 50.000</p>
                    <p>Hadiah:<br />Grand Prize menangkan Pajero Sport Black</p>
                </section>

                <!-- Content -->
                <section class="bg-white rounded-xl shadow p-5 text-sm leading-relaxed text-gray-800">
                    <h2 class="text-base font-semibold mb-3">Deskripsi Kompetisi</h2>
                    <div class="prose prose-sm max-w-none">
                        {@html competition.contentHtml}
                    </div>
                </section>

                <!-- Contact Section -->
                <section class="bg-white rounded-xl shadow p-5 text-sm leading-relaxed text-gray-800">
                    <h3 class="text-sm font-semibold mb-2">Kontak Penyelenggara</h3>
                    <ul class="space-y-1">
                        <li>
                            <span class="font-medium text-gray-600">Instagram:</span>
                            <a
                                href={competition.instagram}
                                class="ml-1 text-red-600 hover:text-red-700"
                                target="_blank"
                                rel="noreferrer"
                            >
                                {competition.instagram}
                            </a>
                        </li>
                        <li>
                            <span class="font-medium text-gray-600">Facebook:</span>
                            <a
                                href={competition.facebook}
                                class="ml-1 text-red-600 hover:text-red-700"
                                target="_blank"
                                rel="noreferrer"
                            >
                                {competition.facebook}
                            </a>
                        </li>
                        <li>
                            <span class="font-medium text-gray-600">WhatsApp:</span>
                            <a
                                href={competition.whatsapp}
                                class="ml-1 text-red-600 hover:text-red-700"
                                target="_blank"
                                rel="noreferrer"
                            >
                                {competition.whatsapp}
                            </a>
                        </li>
                    </ul>
                </section>

                <!-- Primary Action Button -->
                <div class="pt-2">
                    <Button
                        text="Ikuti Kompetisi"
                        type="link"
                        href={competition.applyUrl}
                        variant="large"
                        size="full"
                    />
                </div>
            {:else}
                <!-- Discussions Tab (empty content for now) -->
                <section class="bg-white rounded-xl shadow p-5 text-sm text-gray-700 min-h-[120px] flex items-center justify-center">
                    <p class="text-gray-400">Belum ada diskusi.</p>
                </section>
            {/if}
        </div>
    </div>
</main>

{#if showPosterModal}
    <!-- Poster Modal -->
    <div class="fixed inset-0 z-40 flex items-center justify-center bg-black/70 px-4" on:click={() => (showPosterModal = false)}>
        <div class="relative max-w-3xl w-full max-h-[90vh]" on:click|stopPropagation>
            <button
                type="button"
                class="absolute -top-3 -right-3 bg-white rounded-full shadow p-1 text-gray-700 hover:text-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                on:click={() => (showPosterModal = false)}
                aria-label="Tutup gambar poster"
            >
                ✕
            </button>
            <div class="overflow-hidden rounded-xl bg-black max-h-[90vh]">
                <img
                    src={competition.poster}
                    alt={title || 'Competition poster'}
                    class="w-full h-full object-contain bg-black"
                />
            </div>
        </div>
    </div>
{/if}

<style>
    /* Add any additional styles here */
</style>
