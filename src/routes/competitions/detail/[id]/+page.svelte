<script lang="ts">
    import { page } from '$app/stores';
    import { onMount } from 'svelte';
    import { browser } from '$app/environment';
    import Button from '$lib/components/Button.svelte';
    import { showSnackbar } from '$lib/stores/snackbar';
    import Spinner from '$lib/components/Spinner.svelte';
    import FullWidthMessage from '$lib/components/FullWidthMessage.svelte';
    import type { PageData } from './$types';

    export let data: PageData;

    let competitionId = '';
    let title = '';
    let activeTab: 'regulations' | 'discussions' = 'regulations';
    let showPosterModal = false;
    let showStatusMenu = false;
    let loading = false; // Changed to false since data is loaded on server
    let error: string | null = null;
    
    // Competition data from layout
    let competition = (data as any)?.competition || null;
    error = (data as any)?.error || null;

    const slugify = (value: string) =>
        value
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');

    $: organizerDetailPath = competition ? `/competitions?organizer=${competition.organizer.id}&organizer_name=${encodeURIComponent(competition.organizer.name)}` : '';

    $: statusLabel = competition 
        ? competition.status === 'open'
            ? 'Open'
            : competition.status === 'ended'
                ? 'Berakhir'
                : 'Berlangsung'
        : '';

    $: statusColor = competition 
        ? competition.status === 'open'
            ? 'green'
            : competition.status === 'ended'
                ? 'red'
                : 'gray'
        : 'gray';

    // Format date for display
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', { 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric' 
        });
    };

    // Load data on mount (browser only) - only for client-side specific logic
    onMount(async () => {
        if (!browser) return;
        
        // Get competition ID from URL for client-side operations
        const idFromUrl = $page.params.id;
        if (idFromUrl) {
            competitionId = idFromUrl.split('-')[idFromUrl.split('-').length - 1];
        }
        
        // Set title if competition exists
        if (competition) {
            title = competition.title;
        }
    });

    async function copyInstagramCaption() {
        try {
            const captionTitle = competition?.title || 'Competition Detail';
            const captionDesc = competition?.desc ? getFirstThreeParagraphs(competition.desc) : '';
            
            // Find Instagram contact if available
            const instagramContact = competition?.contacts?.find(contact => 
                contact.type === 'instagram' || 
                (contact.type === 'link' && contact.value.includes('instagram.com'))
            );
            
            // Extract Instagram username (remove @ if present, or extract from URL)
            let instagramUsername = '';
            if (instagramContact) {
                const value = instagramContact.value;
                if (value.includes('@')) {
                    instagramUsername = value.split('@').pop().trim();
                } else if (value.includes('instagram.com/')) {
                    instagramUsername = value.split('instagram.com/').pop().split('/')[0].trim();
                } else {
                    instagramUsername = value.replace('@', '').trim();
                }
            }
            
            const captionLink = $page.url.href;
            
            // Build caption with Instagram username if available
            let caption = `${captionTitle}\n\n${captionDesc}`;
            if (instagramUsername) {
                caption += `\n\n@${instagramUsername}`;
            }
            caption += `\n\n${captionLink}`;
            
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

    // Function to get first three paragraphs from HTML
    function getFirstThreeParagraphs(html: string): string {
        // Create a temporary div element to parse HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        
        // Get all paragraph elements
        const paragraphs = tempDiv.querySelectorAll('p');
        
        if (paragraphs.length === 0) {
            // If no p tags found, get all text content and split by double newlines
            const allText = tempDiv.textContent || tempDiv.innerText || '';
            const textParagraphs = allText.split(/\n\s*\n/).filter(p => p.trim().length > 0);
            return textParagraphs.slice(0, 3).join('\n\n').trim();
        }
        
        // Get text from first 3 paragraph elements
        const firstThreeTexts = Array.from(paragraphs).slice(0, 3).map(p => p.textContent?.trim() || '').filter(text => text.length > 0);
        
        if (firstThreeTexts.length === 0) {
            return '';
        }
        
        return firstThreeTexts.join('\n\n');
    }

    // Function to strip HTML tags from string
    function stripHtml(html: string): string {
        // Create a temporary div element to parse HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        return tempDiv.textContent || tempDiv.innerText || '';
    }
</script>

<main class="max-w-5xl mx-auto px-4 py-8">
    <!-- Loading State -->
    {#if loading}
        <div class="flex justify-center py-16">
            <Spinner size="large" color="primary" />
        </div>
    {:else if error}
        <div class="py-16">
            <FullWidthMessage
                text="Gagal Memuat Kompetisi"
                subtext={error}
            />
        </div>
    {:else if !competition}
        <div class="py-16">
            <FullWidthMessage
                text="Kompetisi Tidak Ditemukan"
                subtext="Kompetisi yang Anda cari tidak tersedia atau telah dihapus."
            />
        </div>
    {:else}
        <h1 class="text-3xl sm:text-4xl font-bold text-gray-900 mb-6 capitalize">
            {title || competition.title || 'Competition Detail'}
        </h1>
        <div style="height:20px"></div>
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
                        src={competition.poster || 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1131&q=80'}
                        alt={competition.title || 'Competition poster'}
                        class="w-full h-full object-cover cursor-zoom-in"
                    />
                </button>
            </div>

            <!-- Meta, Hadiah, Content & Button (in tabs) -->
            <div class="w-full lg:w-1/2 space-y-6">
                <!-- Status + Actions -->
                <div class="flex items-center justify-between gap-3">
                    <div class="inline-flex items-center px-3 py-1.5 rounded-full bg-{statusColor}-50 text-xs sm:text-sm font-semibold text-{statusColor}-700 border border-{statusColor}-200">
                        <span class="w-2 h-2 rounded-full bg-{statusColor}-500 mr-2"></span>
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
                            class="absolute right-0 mt-2 w-44 rounded-md bg-white shadow-lg ring-1 ring-black/5 z-10 text-sm"
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
                    Regulasi
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
                    Komentar
                </button>
            </div>

            {#if activeTab === 'regulations'}
                <!-- Meta data -->
                <section class="bg-white rounded-xl shadow p-5 space-y-3 text-sm text-gray-700">
                    <div class="flex justify-between items-center">
                        <span class="font-medium text-gray-500">Penyelenggara</span>
                        <a
                            href={organizerDetailPath}
                            class="flex items-center gap-2 text-red-600 hover:text-red-700 font-medium transition-colors duration-150"
                        >
                            <img
                                src={competition.organizer?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=150&h=150&q=80'}
                                alt={competition.organizer?.name || 'Organizer avatar'}
                                class="w-6 h-6 rounded-full object-cover"
                                loading="lazy"
                                decoding="async"
                            />
                            {competition.organizer?.name || 'Unknown'}
                        </a>
                    </div>
                    <div class="flex justify-between">
                        <span class="font-medium text-gray-500">Kategori</span>
                        <span>{competition.category?.name || 'Uncategorized'}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="font-medium text-gray-500">Tanggal dibuat</span>
                        <span>{formatDate(competition.created_date)}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="font-medium text-gray-500">Deadline pendaftaran</span>
                        <span>{formatDate(competition.deadline_date)}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="font-medium text-gray-500">Pengumuman pemenang</span>
                        <span>{formatDate(competition.announcement_date)}</span>
                    </div>
                    <div class="flex justify-between border-t border-gray-100 pt-3 mt-1">
                        <span class="font-medium text-gray-500">Total views</span>
                        <span>{competition.views?.toLocaleString() || '0'}x</span>
                    </div>
                </section>

                <!-- Hadiah Section -->
                <section class="bg-white rounded-xl shadow p-5 text-sm leading-relaxed text-gray-800">
                    <h2 class="text-base font-semibold mb-3">Hadiah</h2>
                    {#if competition.prize_estimate}
                        <p class="mb-1">Estimasi Total Hadiah Rp : {competition.prize_estimate.toLocaleString('id-ID')}</p>
                    {/if}
                    <div class="prose prose-sm max-w-none competition-description">
                        {@html competition.prize_desc || '<p>Tidak ada informasi hadiah</p>'}
                    </div>
                </section>

                <!-- Content -->
                <section class="bg-white rounded-xl shadow p-5 text-sm leading-relaxed text-gray-800">
                    <h2 class="text-base font-semibold mb-3">Deskripsi Kompetisi</h2>
                    <div class="prose prose-sm max-w-none competition-description">
                {@html competition.desc || '<p>Tidak ada deskripsi tersedia.</p>'}
            </div>

            <style>
                /* Custom styles for competition description */
                .competition-description h2 {
                    font-size: 1.5rem;
                    font-weight: 600;
                    margin: 1.5rem 0 1rem 0;
                    color: #111827;
                }

                .competition-description h3 {
                    font-size: 1.25rem;
                    font-weight: 600;
                    margin: 1.25rem 0 0.75rem 0;
                    color: #111827;
                }

                .competition-description h4 {
                    font-size: 1.125rem;
                    font-weight: 600;
                    margin: 1rem 0 0.5rem 0;
                    color: #111827;
                }

                .competition-description p {
                    font-size: 0.875rem;
                    line-height: 1.6;
                    margin: 0.75rem 0;
                    color: #374151;
                }

                .competition-description ol {
                    list-style-type: decimal;
                    padding-left: 5px;
                    margin: 1rem 0;
                }

                .competition-description ul {
                    list-style-type: disc;
                    padding-left: 5px;
                    margin: 1rem 0;
                }

                .competition-description ol li,
                .competition-description ul li {
                    margin-bottom: 0.5rem;
                    list-style-position: outside;
                    padding-left: 0px;
                    text-indent: 0;
                }

                /* Nested lists styling */
                .competition-description ol ol,
                .competition-description ul ul {
                    margin-top: 0.5rem;
                    margin-left: 2rem;
                }

                .competition-description ol ol li,
                .competition-description ul ul li {
                    margin-bottom: 0.25rem;
                }

                .competition-description ol ul,
                .competition-description ul ol {
                    margin-top: 0.5rem;
                    margin-left: 2rem;
                }

                .competition-description ol ul li,
                .competition-description ul ol li {
                    margin-bottom: 0.25rem;
                }

                .competition-description {
                    word-wrap: break-word;
                    word-break: break-word;
                    overflow-wrap: break-word;
                }

                .competition-description a {
                    color: rgb(239 68 68) !important; /* red-600 */
                    text-decoration: underline;
                    font-weight: 500;
                }

                .competition-description a:hover {
                    color: rgb(220 38 38) !important; /* red-700 */
                    text-decoration: none;
                }

                /* Contact links wrapping */
                .contact-link {
                    word-wrap: break-word;
                    word-break: break-word;
                    overflow-wrap: break-word;
                    max-width: 100%;
                }
            </style>
                </section>

                <!-- Contact Section -->
                <section class="bg-white rounded-xl shadow p-5 text-sm leading-relaxed text-gray-800">
                    <h3 class="text-sm font-semibold mb-2">Kontak Penyelenggara</h3>
                    <ul class="space-y-1">
                        {#each competition.contacts || [] as contact}
                            <li>
                                <span class="font-medium text-gray-600 capitalize">{contact.type}:</span>
                                {#if contact.type === 'email'}
                                    <a
                                        href="mailto:{contact.value}"
                                        class="ml-1 text-red-600 hover:text-red-700 contact-link"
                                    >
                                        {contact.value}
                                    </a>
                                {:else if contact.type === 'phone' || contact.type === 'whatsapp'}
                                    <a
                                        href="https://wa.me/{contact.value.replace(/[^0-9+]/g, '')}"
                                        class="ml-1 text-red-600 hover:text-red-700 contact-link"
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        {contact.value}
                                    </a>
                                {:else if contact.type === 'instagram'}
                                    <a
                                        href="https://instagram.com/{contact.value.replace('@', '')}"
                                        class="ml-1 text-red-600 hover:text-red-700 contact-link"
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        {contact.value}
                                    </a>
                                {:else}
                                    <a
                                        href={contact.value}
                                        class="ml-1 text-red-600 hover:text-red-700 contact-link"
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        {contact.value}
                                    </a>
                                {/if}
                            </li>
                        {/each}
                        {#if !competition.contacts || competition.contacts.length === 0}
                            <li class="text-gray-500">Tidak ada informasi kontak tersedia</li>
                        {/if}
                    </ul>
                </section>

                <!-- Primary Action Button -->
                <div class="pt-2">
                    <Button
                        text="Ikuti Kompetisi"
                        type="link"
                        href={competition.link_join || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        variant="large"
                        size="full"
                    />
                </div>
            {:else}
                <!-- Discussions Tab with Facebook Comments -->
                <section class="bg-white rounded-xl shadow p-5 text-sm text-gray-700">
                    <h3 class="text-sm font-semibold mb-4">Komentar</h3>
                    
                    <!-- Facebook Comments Plugin -->
                    <div id="fb-root"></div>
                    <script async defer crossorigin="anonymous" src="https://connect.facebook.net/id_ID/sdk.js#xfbml=1&version=v19.0&appId=1419514554927551"></script>
                    
                    <div 
                        class="fb-comments" 
                        data-href={$page.url.href}
                        data-width="100%"
                        data-numposts="10"
                        data-order-by="reverse_time"
                        data-lazy="true"
                    ></div>
                    
                    <!-- Fallback message -->
                    <p class="text-gray-500 text-xs mt-4">
                        Jika komentar tidak muncul, silakan refresh halaman atau periksa koneksi internet Anda.
                    </p>
                </section>
            {/if}
        </div>
    </div>
    {/if}
</main>

{#if showPosterModal}
    <!-- Poster Modal -->
    <div
        class="fixed inset-0 z-40 flex items-center justify-center bg-black/70 px-4"
        role="button"
        aria-label="Tutup modal poster"
        tabindex="0"
        on:click={() => (showPosterModal = false)}
        on:keydown={(event) => {
            if (event.key === 'Escape' || event.key === 'Enter' || event.key === ' ') {
                showPosterModal = false;
            }
        }}
    >
        <div
            class="relative max-w-3xl w-full"
            role="dialog"
            aria-modal="true"
            aria-label={title || competition.title || 'Poster kompetisi'}
            tabindex="-1"
            on:click|stopPropagation
            on:keydown={(event) => {
                if (event.key === 'Escape') {
                    showPosterModal = false;
                }
            }}
        >
            <button
                type="button"
                class="absolute -top-3 -right-3 bg-white rounded-full shadow p-1 text-gray-700 hover:text-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                on:click={() => (showPosterModal = false)}
                aria-label="Tutup gambar poster"
            >
                ✕
            </button>
            <div class="rounded-xl bg-black flex items-center justify-center max-h-[90vh]">
                <img
                    src={competition.poster}
                    alt={title || competition.title || 'Competition poster'}
                    class="max-h-[90vh] w-auto object-contain bg-black"
                    loading="lazy"
                    decoding="async"
                />
            </div>
        </div>
    </div>
{/if}

<style>
    /* Add any additional styles here */
</style>
