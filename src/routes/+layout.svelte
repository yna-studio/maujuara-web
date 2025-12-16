<script lang="ts">
	import '../app.css';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import { page } from '$app/stores';
	import { snackbar } from '$lib/stores/snackbar';
	import type { LayoutData } from './$types';
	
	export let data: LayoutData;
	
	// Get competition data from child layouts (if available)
	$: competitionData = (data as any)?.competition || null;
	$: newsData = (data as any)?.news || null;

	// Build simple breadcrumb from current path
	$: segments = $page.url.pathname.split('/').filter(Boolean);
	$: isHome = segments.length === 0;
	$: isErrorPage = $page.status && $page.status >= 400;
	$: isCompetitionDetail = segments[0] === 'competitions' && segments[1] === 'detail';
	$: isNewsDetail = segments[0] === 'news' && segments[1] === 'detail';
	const formatSegment = (segment: string) =>
		segment.charAt(0).toUpperCase() + segment.slice(1);
	
	// Special handling for competition and news detail pages
	$: breadcrumbItems = [
		{ label: 'Home', href: '/' },
		...segments.map((segment, index) => {
			// For competition detail pages, use "Kompetisi" for the competitions segment
			// and skip the "detail" segment since we'll handle it separately
			if (isCompetitionDetail) {
				if (index === 0) {
					return { label: 'Kompetisi', href: '/competitions' };
				} else if (index === 1) {
					// Skip the "detail" segment - we'll add the competition title separately
					return null;
				}
			}
			
			// For news detail pages, use "Berita" for the news segment
			// and skip the "detail" segment since we'll handle it separately
			if (isNewsDetail) {
				if (index === 0) {
					return { label: 'Berita', href: '/news' };
				} else if (index === 1) {
					// Skip the "detail" segment - we'll add the news title separately
					return null;
				}
			}
			
			// For news main page, use "Berita" instead of "News"
			if (segment === 'news' && !isNewsDetail) {
				return { label: 'Berita', href: '/news' };
			}
			
			return {
				label: formatSegment(segment),
				href: '/' + segments.slice(0, index + 1).join('/'),
			};
		}).filter(Boolean)
	];
	
	// Add competition title for detail pages if we have the data
	$: if (isCompetitionDetail && competitionData?.title) {
		// Clean title by removing any ID suffix if present
		const cleanTitle = competitionData.title.replace(/-[\w\d]+$/, '');
		breadcrumbItems = [...breadcrumbItems, { 
			label: cleanTitle, 
			href: $page.url.pathname 
		}];
	}
	
	// Add news title for detail pages if we have the data
	$: if (isNewsDetail && newsData?.title) {
		// Clean title by removing any ID suffix if present
		const cleanTitle = newsData.title.replace(/-[\w\d]+$/, '');
		breadcrumbItems = [...breadcrumbItems, { 
			label: cleanTitle, 
			href: $page.url.pathname 
		}];
	}
	
	// Default SEO metadata
	$: defaultTitle = data.seo?.defaultTitle || 'MauJuara - Ikuti dan menangkan hadiah dari kompetisi online';
	$: defaultDescription = data.seo?.defaultDescription || 'MauJuara adalah platform kompetisi online yang bisa diikuti seluruh netizen, pilih kategori favoritmu dan menangkan hadiahnya';
	$: defaultImage = data.seo?.defaultImage || 'https://maujuara.com/images/Mau%20Juara%20-%20landscape.svg';
	$: siteName = data.seo?.siteName || 'Maujuara';
	$: twitterHandle = data.seo?.twitterHandle || '@maujuara';
	$: host = data.seo?.host || 'http://localhost:20251';
</script>

<svelte:head>
	<!-- Basic Meta Tags -->
	<title>{defaultTitle}</title>
	<meta name="description" content={defaultDescription} />
	<meta name="keywords" content="kompetisi, lomba, kontes, online, hadiah, indonesia" />
	<meta name="author" content={siteName} />
	
	<!-- Open Graph / Facebook -->
	<meta property="og:type" content="website" />
	<meta property="og:title" content={defaultTitle} />
	<meta property="og:description" content={defaultDescription} />
	<meta property="og:url" content={host} />
	<meta property="og:image" content={defaultImage} />
	<meta property="og:image:alt" content={defaultTitle} />
	<meta property="og:site_name" content={siteName} />
	<meta property="og:locale" content="id_ID" />
	
	<!-- Twitter Card -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={defaultTitle} />
	<meta name="twitter:description" content={defaultDescription} />
	<meta name="twitter:image" content={defaultImage} />
	<meta name="twitter:image:alt" content={defaultTitle} />
	<meta name="twitter:site" content={twitterHandle} />
	<meta name="twitter:creator" content={twitterHandle} />
	
	<!-- Additional SEO Meta Tags -->
	<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
	<link rel="canonical" href={host} />
	
	<!-- Favicon -->
	<link rel="icon" href="/favicon.ico" sizes="any" />
	<link rel="icon" href="/icon.svg" type="image/svg+xml" />
	<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
	
	<!-- Schema.org JSON-LD -->
	<script type="application/ld+json">
		{JSON.stringify({
			"@context": "https://schema.org",
			"@type": "WebSite",
			"name": siteName,
			"description": defaultDescription,
			"url": host,
			"image": defaultImage,
			"publisher": {
				"@type": "Organization",
				"name": siteName,
				"url": host
			},
			"potentialAction": {
				"@type": "SearchAction",
				"target": `${host}/search?q={search_term_string}`,
				"query-input": "required name=search_term_string"
			}
		})}
	</script>
	
	<!-- Google tag (gtag.js) -->
	<script async src="https://www.googletagmanager.com/gtag/js?id=G-T5PG1WN7NZ"></script>
	<script>
		window.dataLayer = window.dataLayer || [];
		function gtag(){dataLayer.push(arguments);}
		gtag('js', new Date());

		gtag('config', 'G-T5PG1WN7NZ');
	</script>
	
	<!-- Facebook SDK for Comments -->
	<script async defer crossorigin="anonymous" src="https://connect.facebook.net/id_ID/sdk.js#xfbml=1&version=v19.0&appId=1419514554927551" nonce="random"></script>
</svelte:head>

<div class="min-h-screen flex flex-col">
	<Header />

	{#if !isHome}
		<div class="px-4 pt-6 pb-2">
			<div class="max-w-5xl mx-auto px-3">
				<nav class="text-md sm:text-sm {isErrorPage ? 'text-center' : 'text-left'}" aria-label="Breadcrumb">
				{#each breadcrumbItems as item, index (item.href)}
					{#if index === breadcrumbItems.length - 1}
						<span class="font-medium text-red-600">{item.label}</span>
					{:else}
						<a
							href={item.href}
							class="text-gray-500 hover:text-red-600 transition-colors duration-150"
						>
							{item.label}
						</a>
						<span class="mx-1 text-gray-400">/</span>
					{/if}
				{/each}
			</nav>
			</div>
		</div>
	{/if}

	<main class="flex-grow">
		<slot />
	</main>
	<Footer />

	{#if $snackbar.visible}
		<div class="fixed inset-x-0 bottom-4 z-50 flex justify-center px-4 pointer-events-none">
			<div class="pointer-events-auto max-w-sm w-full bg-gray-900 text-white text-sm sm:text-base rounded-lg shadow-lg px-4 py-3 flex items-center gap-3">
				<span class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/10 flex-shrink-0">
					{#if $snackbar.message.toLowerCase().includes('fail')}
						<!-- Error icon -->
						<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
							<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-5a1 1 0 112 0 1 1 0 01-2 0zm0-6a1 1 0 012 0v4a1 1 0 11-2 0V7z" clip-rule="evenodd" />
						</svg>
					{:else}
						<!-- Success icon -->
						<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
							<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.707a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
						</svg>
					{/if}
				</span>
				<span class="flex-1 text-center">{$snackbar.message}</span>
			</div>
		</div>
	{/if}
</div>

