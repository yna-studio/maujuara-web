<script lang="ts">
	import '../app.css';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import { page } from '$app/stores';
	import { snackbar } from '$lib/stores/snackbar';

	// Build simple breadcrumb from current path
	$: segments = $page.url.pathname.split('/').filter(Boolean);
	$: isHome = segments.length === 0;
	$: isErrorPage = $page.status && $page.status >= 400;
	const formatSegment = (segment: string) =>
		segment.charAt(0).toUpperCase() + segment.slice(1);
	$: breadcrumbItems = [
		{ label: 'Home', href: '/' },
		...segments.map((segment, index) => ({
			label: formatSegment(segment),
			href: '/' + segments.slice(0, index + 1).join('/'),
		}))
	];
</script>

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

