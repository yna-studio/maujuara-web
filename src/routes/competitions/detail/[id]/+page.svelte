<script lang="ts">
    import { page } from "$app/stores";
    import { onMount } from "svelte";
    import { browser } from "$app/environment";
    import Button from "$lib/components/Button.svelte";
    import { showSnackbar } from "$lib/stores/snackbar";
    import Spinner from "$lib/components/Spinner.svelte";
    import FullWidthMessage from "$lib/components/FullWidthMessage.svelte";
    import type { PageData } from "./$types";

    export let data: PageData;

    let competitionId = "";
    let title = "";
    let activeTab: "regulations" | "discussions" = "regulations";
    let showPosterModal = false;
    let showStatusMenu = false;
    let loading = false;
    let error: string | null = null;

    // Competition data from layout
    let competition = (data as any)?.competition || null;
    error = (data as any)?.error || null;

    const slugify = (value: string) =>
        value
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");

    const generateCompetitionUrl = (comp: any) => {
        const titleSlug = slugify(comp.title);
        return `/competitions/detail/${titleSlug}-${comp._id}`;
    };

    $: organizerDetailPath =
        competition && competition.organizer
            ? `/competitions?organizer=${competition.organizer.id}&organizer_name=${encodeURIComponent(competition.organizer.name)}`
            : "";

    // Watch for URL changes and refetch data
    $: if ($page.params.id && competitionId !== $page.params.id) {
        loadCompetitionData();
    }

    async function loadCompetitionData() {
        if (!browser) return;

        loading = true;
        error = null;

        try {
            const idFromUrl = $page.params.id;
            const extractedId =
                idFromUrl.split("-")[idFromUrl.split("-").length - 1];

            const response = await fetch(`/api/competitions/${extractedId}`);

            if (!response.ok) {
                if (response.status === 404) {
                    error = "Kompetisi tidak ditemukan";
                } else {
                    error = "Gagal memuat data kompetisi";
                }
                competition = null;
                return;
            }

            const result = await response.json();
            competition = result.data;
            competitionId = $page.params.id;
        } catch (err) {
            console.error("Error loading competition data:", err);
            error = "Gagal memuat data kompetisi";
            competition = null;
        } finally {
            loading = false;
        }
    }

    $: statusLabel = competition
        ? competition.status === "open"
            ? "Open"
            : competition.status === "ended"
              ? "Berakhir"
              : "Berlangsung"
        : "";

    $: statusColor = competition
        ? competition.status === "open"
            ? "green"
            : competition.status === "ended"
              ? "red"
              : "gray"
        : "gray";

    // Format date for display
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    };

    // Load data on mount (browser only) - only for client-side specific logic
    onMount(async () => {
        if (!browser) return;

        // Get competition ID from URL for client-side operations
        const idFromUrl = $page.params.id;
        if (idFromUrl) {
            competitionId =
                idFromUrl.split("-")[idFromUrl.split("-").length - 1];
        }

        // Set title if competition exists
        if (competition) {
            title = competition.title;
        }
    });

    async function copyInstagramCaption() {
        try {
            const captionTitle = competition?.title || "Competition Detail";

            // Clear all HTML and get first 50 words with ... suffix
            let captionDesc = "";
            if (competition?.desc) {
                // Strip all HTML tags
                const tempDiv = document.createElement("div");
                tempDiv.innerHTML = competition.desc;
                const plainText =
                    tempDiv.textContent || tempDiv.innerText || "";

                // Split into words and get first 50
                const words = plainText.trim().split(/\s+/);
                if (words.length > 50) {
                    captionDesc = words.slice(0, 50).join(" ") + "...";
                } else {
                    captionDesc = plainText.trim();
                }
            }

            // Find Instagram contact if available
            const instagramContact = competition?.contacts?.find(
                (contact) =>
                    contact.type === "instagram" ||
                    (contact.type === "link" &&
                        contact.value.includes("instagram.com")),
            );

            // Extract Instagram username (remove @ if present, or extract from URL)
            let instagramUsername = "";
            if (instagramContact) {
                const value = instagramContact.value;
                if (value.includes("@")) {
                    instagramUsername = value.split("@").pop().trim();
                } else if (value.includes("instagram.com/")) {
                    instagramUsername = value
                        .split("instagram.com/")
                        .pop()
                        .split("/")[0]
                        .trim();
                } else {
                    instagramUsername = value.replace("@", "").trim();
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
                console.warn(
                    "Clipboard API not available, caption not copied automatically.",
                );
            }
            showStatusMenu = false;
            showSnackbar("Caption copied successfully");
        } catch (e) {
            console.error("Failed to copy caption", e);
            // Still show snackbar so user sees feedback
            showStatusMenu = false;
            showSnackbar("Failed to copy caption");
        }
    }

    // Function to get first three paragraphs from HTML
    function getFirstThreeParagraphs(html: string): string {
        // Create a temporary div element to parse HTML
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = html;

        // Get all paragraph elements
        const paragraphs = tempDiv.querySelectorAll("p");

        if (paragraphs.length === 0) {
            // If no p tags found, get all text content and split by double newlines
            const allText = tempDiv.textContent || tempDiv.innerText || "";
            const textParagraphs = allText
                .split(/\n\s*\n/)
                .filter((p) => p.trim().length > 0);
            return textParagraphs.slice(0, 3).join("\n\n").trim();
        }

        // Get text from first 3 paragraph elements
        const firstThreeTexts = Array.from(paragraphs)
            .slice(0, 3)
            .map((p) => p.textContent?.trim() || "")
            .filter((text) => text.length > 0);

        if (firstThreeTexts.length === 0) {
            return "";
        }

        return firstThreeTexts.join("\n\n");
    }

    // Function to strip HTML tags from string
    function stripHtml(html: string): string {
        // Create a temporary div element to parse HTML
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = html;
        return tempDiv.textContent || tempDiv.innerText || "";
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
            <FullWidthMessage text="Gagal Memuat Kompetisi" subtext={error} />
        </div>
    {:else if !competition}
        <div class="py-16">
            <FullWidthMessage
                text="Kompetisi Tidak Ditemukan"
                subtext="Kompetisi yang Anda cari tidak tersedia atau telah dihapus."
            />
        </div>
    {:else}
        <h1
            class="text-3xl sm:text-4xl font-bold text-gray-900 mb-6 capitalize"
        >
            {title || competition.title || "Competition Detail"}
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
                        src={competition.poster ||
                            "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1131&q=80"}
                        alt={competition.title || "Competition poster"}
                        class="w-full h-full object-cover cursor-zoom-in"
                    />
                </button>
            </div>

            <!-- Meta, Hadiah, Content & Button (in tabs) -->
            <div class="w-full lg:w-1/2 space-y-6">
                <!-- Status + Actions -->
                <div class="flex items-center justify-between gap-3">
                    <div
                        class="inline-flex items-center px-3 py-1.5 rounded-full bg-{statusColor}-50 text-xs sm:text-sm font-semibold text-{statusColor}-700 border border-{statusColor}-200"
                    >
                        <span
                            class="w-2 h-2 rounded-full bg-{statusColor}-500 mr-2"
                        ></span>
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
                            activeTab === "regulations"
                                ? "border-red-600 text-red-600 font-semibold"
                                : "border-transparent text-gray-600 hover:text-red-600"
                        }`}
                        on:click={() => (activeTab = "regulations")}
                    >
                        Regulasi
                    </button>
                    <button
                        type="button"
                        class={`pb-2 border-b-2 transition-colors duration-150 ${
                            activeTab === "contacts"
                                ? "border-red-600 text-red-600 font-semibold"
                                : "border-transparent text-gray-600 hover:text-red-600"
                        }`}
                        on:click={() => (activeTab = "contacts")}
                    >
                        Kontak
                    </button>
                    <button
                        type="button"
                        class={`pb-2 border-b-2 transition-colors duration-150 ${
                            activeTab === "discussions"
                                ? "border-red-600 text-red-600 font-semibold"
                                : "border-transparent text-gray-600 hover:text-red-600"
                        }`}
                        on:click={() => (activeTab = "discussions")}
                    >
                        Komentar
                    </button>
                </div>

                {#if activeTab === "regulations"}
                    <!-- Meta data -->
                    <section
                        class="bg-white rounded-xl shadow p-5 space-y-3 text-sm text-gray-700"
                    >
                        <div class="flex justify-between items-center">
                            <span class="font-medium text-gray-500"
                                >Penyelenggara</span
                            >
                            <a
                                href={organizerDetailPath}
                                class="flex items-center gap-2 text-red-600 hover:text-red-700 font-medium transition-colors duration-150"
                            >
                                <img
                                    src={competition.organizer?.avatar ||
                                        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=150&h=150&q=80"}
                                    alt={competition.organizer?.name ||
                                        "Organizer avatar"}
                                    class="w-6 h-6 rounded-full object-cover"
                                    loading="lazy"
                                    decoding="async"
                                />
                                {competition.organizer?.name || "Unknown"}
                            </a>
                        </div>
                        <div class="flex justify-between">
                            <span class="font-medium text-gray-500"
                                >Kategori</span
                            >
                            <span
                                >{competition.category?.name ||
                                    "Uncategorized"}</span
                            >
                        </div>
                        <div class="flex justify-between">
                            <span class="font-medium text-gray-500"
                                >Tanggal dibuat</span
                            >
                            <span>{formatDate(competition.created_date)}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="font-medium text-gray-500"
                                >Deadline pendaftaran</span
                            >
                            <span>{formatDate(competition.deadline_date)}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="font-medium text-gray-500"
                                >Pengumuman pemenang</span
                            >
                            <span
                                >{formatDate(
                                    competition.announcement_date,
                                )}</span
                            >
                        </div>
                        <div
                            class="flex justify-between border-t border-gray-100 pt-3 mt-1"
                        >
                            <span class="font-medium text-gray-500"
                                >Total views</span
                            >
                            <span
                                >{competition.views?.toLocaleString() ||
                                    "0"}x</span
                            >
                        </div>
                    </section>

                    <!-- Hadiah Section -->
                    <section
                        class="bg-white rounded-xl shadow p-5 text-sm leading-relaxed text-gray-800"
                    >
                        <h2 class="text-base font-semibold mb-3">Hadiah</h2>
                        {#if competition.prize_estimate}
                            <p class="mb-4">
                                Estimasi Total Hadiah Rp : {competition.prize_estimate.toLocaleString(
                                    "id-ID",
                                )}
                            </p>
                        {/if}
                        <div
                            class="prose prose-sm max-w-none competition-description"
                        >
                            {@html competition.prize_desc ||
                                "<p>Tidak ada informasi hadiah</p>"}
                        </div>
                    </section>

                    <!-- Content -->
                    <section
                        class="bg-white rounded-xl shadow p-5 text-sm leading-relaxed text-gray-800"
                    >
                        <h2 class="text-base font-semibold mb-3">
                            Deskripsi Kompetisi
                        </h2>
                        <div
                            class="prose prose-sm max-w-none competition-description "
                        >
                            {@html competition.desc ||
                                "<p>Tidak ada deskripsi tersedia.</p>"}
                        </div>
                    </section>

                    <!-- Tags Section -->
                    {#if competition?.tags && competition.tags.length > 0}
                        <div class="pt-4 pb-2 lg:block">
                            <div class="flex flex-wrap gap-2">
                                {#each competition.tags as tag}
                                    <a
                                        href="/competitions?tag={tag}"
                                        class="inline-flex items-center px-3 py-1 bg-white border border-gray-400 text-black text-sm font-medium rounded-full hover:bg-gray-50 hover:border-gray-500 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                                    >
                                        {tag}
                                    </a>
                                {/each}
                            </div>
                        </div>
                    {/if}

                    <!-- Primary Action Button -->
                    <div class="pt-2 hidden lg:block">
                        <Button
                            text="Ikuti Kompetisi"
                            type="link"
                            href={competition.link_join || "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                            variant="large"
                            size="full"
                        />
                    </div>

                    <!-- Related Competitions Section -->
                    {#if data.relatedCompetitions && data.relatedCompetitions.length > 0}
                        <div class="mt-8">
                            <br />
                            <h3
                                class="text-lg font-semibold text-gray-900 mb-4"
                            >
                                Ikuti Kompetisi Lainnya
                            </h3>
                            <div class="grid grid-cols-2 gap-4">
                                {#each data.relatedCompetitions as relatedComp}
                                    <div
                                        class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200"
                                    >
                                        <a
                                            href={generateCompetitionUrl(
                                                relatedComp,
                                            )}
                                            class="block"
                                        >
                                            <div
                                                class="aspect-w-16 aspect-h-9 bg-gray-100"
                                            >
                                                <img
                                                    src={relatedComp.poster ||
                                                        "/placeholder-competition.jpg"}
                                                    alt={relatedComp.title}
                                                    class="w-full h-32 object-cover"
                                                    on:error={(e) => {
                                                        e.currentTarget.src =
                                                            "/placeholder-competition.jpg";
                                                    }}
                                                />
                                            </div>
                                            <div class="p-3">
                                                <h4
                                                    class="font-medium text-sm text-gray-900 line-clamp-2 mb-1"
                                                >
                                                    {relatedComp.title}
                                                </h4>
                                                {#if relatedComp.prize_estimate}
                                                    <div class="text-xs text-gray-600 mb-1">
                                                        Total Hadiah: Rp {relatedComp.prize_estimate.toLocaleString('id-ID')}
                                                    </div>
                                                {/if}
                                                <div class="flex items-center justify-between">
                                                    <span class="text-xs text-gray-500">
                                                        {formatDate(relatedComp.deadline_date)}
                                                    </span>
                                                    <span class="text-xs px-2 py-1 rounded-full 
                                                        {relatedComp.status === 'open' ? 'bg-green-100 text-green-800' : 
                                                         relatedComp.status === 'progress' ? 'bg-yellow-100 text-yellow-800' : 
                                                         'bg-red-100 text-red-800'}">
                                                        {relatedComp.status === 'open' ? 'Open' : 
                                                         relatedComp.status === 'progress' ? 'Berlangsung' : 
                                                         'Berakhir'}
                                                    </span>
                                                </div>
                                            </div>
                                        </a>
                                    </div>
                                {/each}
                            </div>
                        </div>
                    {/if}
                {:else if activeTab === "contacts"}
                    <!-- Contacts Tab -->
                    <section class="bg-white rounded-xl shadow p-5 text-sm text-gray-700">
                        
                        {#if competition.contacts && competition.contacts.length > 0}
                            <div class="space-y-3">
                                {#each competition.contacts as contact}
                                    <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div class="flex items-center space-x-3">
                                            <div class="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                                                {#if contact.type === 'email'}
                                                    <svg class="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                                                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                                                    </svg>
                                                {:else if contact.type === 'phone' || contact.type === 'whatsapp'}
                                                    <svg class="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
                                                    </svg>
                                                {:else if contact.type === 'instagram'}
                                                    <svg class="w-4 h-4 text-pink-600" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.058 1.645-.07 4.849-.07zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1112.324 0 6.162 6.162 0 01-12.324 0zM12 16a4 4 0 110-8 4 4 0 010 8zm4.965-10.405a1.44 1.44 0 112.881.001 1.44 1.44 0 01-2.881-.001z"/>
                                                    </svg>
                                                {:else if contact.type === 'website'}
                                                    <svg class="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fill-rule="evenodd" d="M4.083 9h1.946c.089-1.546.383-2.97.837-4.118A6.004 6.004 0 004.083 9zM10 2a8 8 0 100 16 8 8 0 000-16zM9.954 4.569c-.768.926-1.298 2.46-1.404 4.431h2.89c-.106-1.97-.636-3.505-1.404-4.43a2.996 2.996 0 00-.082 0zM14.083 9h-1.946c-.089 1.546-.383 2.97-.837 4.118A6.004 6.004 0 0014.083 9zM9.954 15.431c.768-.926 1.298-2.46 1.404-4.431h-2.89c.106 1.97.636 3.505 1.404 4.43a2.996 2.996 0 00.082 0z" clip-rule="evenodd"/>
                                                    </svg>
                                                {:else}
                                                    <svg class="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
                                                    </svg>
                                                {/if}
                                            </div>
                                            <div>
                                                <p class="font-medium text-gray-900 capitalize">{contact.type}</p>
                                                <p class="text-gray-600">{contact.value}</p>
                                            </div>
                                        </div>
                                        <div class="flex space-x-2">
                                            {#if contact.type === 'email'}
                                                <a 
                                                    href="mailto:{contact.value}"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    class="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
                                                >
                                                    Email
                                                </a>
                                            {:else if contact.type === 'phone'}
                                                <a 
                                                    href="tel:{contact.value}"
                                                    class="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
                                                >
                                                    Call
                                                </a>
                                            {:else if contact.type === 'whatsapp'}
                                                <a 
                                                    href="https://wa.me/{contact.value.replace(/[^0-9]/g, '')}"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    class="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                                                >
                                                    WhatsApp
                                                </a>
                                            {:else if contact.type === 'instagram'}
                                                <a 
                                                    href="https://instagram.com/{contact.value.replace('@', '')}"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    class="px-3 py-1 bg-pink-600 text-white text-xs rounded hover:bg-pink-700 transition-colors"
                                                >
                                                    Instagram
                                                </a>
                                            {:else if contact.type === 'website'}
                                                <a 
                                                    href="{contact.value.startsWith('http') ? contact.value : `https://${contact.value}`}"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    class="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                                                >
                                                    Visit
                                                </a>
                                            {/if}
                                        </div>
                                    </div>
                                {/each}
                            </div>
                        {:else}
                            <div class="text-center py-8">
                                <div class="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <svg class="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                                    </svg>
                                </div>
                                <p class="text-gray-500">Belum ada informasi kontak tersedia</p>
                            </div>
                        {/if}
                    </section>
                {:else}
                    <!-- Discussions Tab with Facebook Comments -->
                    <section
                        class="bg-white rounded-xl shadow p-5 text-sm text-gray-700"
                    >
                        <h3 class="text-sm font-semibold mb-4">Komentar</h3>

                        <!-- Facebook Comments Plugin -->
                        <div id="fb-root"></div>
                        <script
                            async
                            defer
                            crossorigin="anonymous"
                            src="https://connect.facebook.net/id_ID/sdk.js#xfbml=1&version=v19.0&appId=1419514554927551"
                        ></script>

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
                            Jika komentar tidak muncul, silakan refresh halaman
                            atau periksa koneksi internet Anda.
                        </p>
                    </section>
                {/if}
            </div>
        </div>
        <!-- </div> -->
        <!-- </div> -->
        
       
        
        <!-- Mobile Sticky Action Button -->
        <div class="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-30">
            <Button
                text="Ikuti Kompetisi"
                type="link"
                href={competition.link_join || "#"}
                target="_blank"
                rel="noopener noreferrer"
                variant="large"
                size="full"
            />
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
            if (
                event.key === "Escape" ||
                event.key === "Enter" ||
                event.key === " "
            ) {
                showPosterModal = false;
            }
        }}
    >
        <div
            class="relative max-w-3xl w-full"
            role="dialog"
            aria-modal="true"
            aria-label={title || competition.title || "Poster kompetisi"}
            tabindex="-1"
            on:click|stopPropagation
            on:keydown={(event) => {
                if (event.key === "Escape") {
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
            <div
                class="rounded-xl bg-black flex items-center justify-center max-h-[90vh]"
            >
                <img
                    src={competition.poster}
                    alt={title || competition.title || "Competition poster"}
                    class="max-h-[90vh] w-auto object-contain bg-black"
                    loading="lazy"
                    decoding="async"
                />
            </div>
        </div>
    </div>
{/if}

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
        list-style-type: decimal !important;
        padding-left: 0;
        margin: 1rem 0 1rem 1rem !important;
    }

    .competition-description ul {
        list-style-type: disc !important;
        padding-left: 0;
        margin: 1rem 0 1rem 1rem !important;
    }

    .competition-description ol li,
    .competition-description ul li {
        margin-bottom: 0.5rem;
        list-style-position: inside;
        padding-left: 1rem;
        text-indent: -1rem;
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

   
    /* Contact links wrapping */
    .contact-link {
        word-wrap: break-word;
        word-break: break-word;
        overflow-wrap: break-word;
        max-width: 100%;
    }
</style>
