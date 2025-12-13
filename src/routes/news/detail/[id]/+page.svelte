<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { NewsAPI } from '$lib/api/news';
	import './+page.css';

	// Type definitions
	interface News {
		_id: string;
		title: string;
		thumbnail: string;
		content: string;
		shortDesc: string;
		tags: string[];
		created_at: string;
		updated_at: string;
		createdBy?: {
			id: string;
			name: string;
			avatar: string;
		};
		created_by: string;
	}

	// Data states
	let news: News | null = null;
	let loading = true;
	let error: string | null = null;

	// Extract ID from slug (format: title-id)
	function extractIdFromSlug(slug: string): string {
		const parts = slug.split('-');
		return parts[parts.length - 1] || '';
	}

	onMount(async () => {
		if (!browser) return;

		try {
			const slug = $page.params.id;
			const newsId = extractIdFromSlug(slug);

			if (!newsId) {
				error = 'Invalid news ID';
				loading = false;
				return;
			}

			// Fetch news detail
			const response = await fetch(`/api/news/${newsId}`);
			const result = await response.json();

			if (!response.ok) {
				error = result.error || 'Failed to fetch news';
				loading = false;
				return;
			}

			news = result.data;
		} catch (err) {
			error = err instanceof Error ? err.message : 'An error occurred';
		} finally {
			loading = false;
		}
	});

	// Format date
	function formatDate(dateString: string): string {
		const date = new Date(dateString);
		return date.toLocaleDateString('id-ID', {
			day: 'numeric',
			month: 'long',
			year: 'numeric'
		});
	}
</script>

<svelte:head>
	<title>{news?.title ? `${news.title} - Maujuara` : 'Detail Berita - Maujuara'}</title>
	<meta name="description" content={news?.shortDesc || 'Baca berita terbaru dari Maujuara'} />
	{#if news?.thumbnail}
		<meta property="og:image" content={news.thumbnail} />
	{/if}
</svelte:head>

<div class="min-h-screen bg-gray-50">
	<!-- Loading State -->
	{#if loading}
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
			<div class="animate-pulse">
				<div class="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
				<div class="h-64 bg-gray-200 rounded mb-6"></div>
				<div class="space-y-4">
					<div class="h-4 bg-gray-200 rounded"></div>
					<div class="h-4 bg-gray-200 rounded"></div>
					<div class="h-4 bg-gray-200 rounded w-5/6"></div>
				</div>
			</div>
		</div>
	{:else if error}
		<!-- Error State -->
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
			<div class="bg-red-50 border border-red-200 rounded-lg p-6">
				<div class="flex items-center">
					<svg class="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
						<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
					</svg>
					<h3 class="text-red-800 font-medium">Error</h3>
				</div>
				<p class="text-red-700 mt-2">{error}</p>
				<button
					onclick={() => goto('/news')}
					class="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
				>
					Kembali ke Berita
				</button>
			</div>
		</div>
	{:else if news}
		<!-- News Content -->
		<article class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
			<!-- Header -->
			<header class="mb-8">
				<!-- Title -->
				<h1 class="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
					{news.title}
				</h1>

				<!-- Meta Information -->
				<div class="flex flex-wrap items-center gap-4 text-gray-600 mb-6">
					<!-- Author -->
					<div class="flex items-center">
						{#if news.createdBy?.avatar}
							<img
								src={news.createdBy.avatar}
								alt={news.createdBy.name}
								class="w-10 h-10 rounded-full mr-3 object-cover"
							/>
						{:else}
							<div class="w-10 h-10 rounded-full bg-gray-300 mr-3 flex items-center justify-center">
								<svg class="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
									<path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
								</svg>
							</div>
						{/if}
						<div>
							<p class="font-medium text-gray-900">{news.createdBy?.name || 'Maujuara Team'}</p>
							<p class="text-sm">{formatDate(news.created_at)}</p>
						</div>
					</div>

					
				</div>

				<div>
					<!-- Tags -->
					{#if news.tags && news.tags.length > 0}
						<div class="flex flex-wrap gap-2">
							{#each news.tags as tag}
								<span class="inline-block bg-gray-100 text-gray-700 text-xs font-semibold px-3 py-1 rounded-full">
									#{tag}
								</span>
							{/each}
						</div>
					{/if}
				</div>
			</header>

			<!-- Featured Image -->
			{#if news.thumbnail}
				<div class="mb-8">
					<img
						src={news.thumbnail}
						alt={news.title}
						class="w-full h-96 md:h-[32rem] object-cover rounded-lg shadow-lg"
						loading="lazy"
						decoding="async"
					/>
				</div>
			{/if}

			<!-- Content -->
			<div class="prose prose-lg max-w-none">
				{@html news.content}
			</div>

			<!-- Footer -->
			<footer class="mt-12 pt-8 border-t border-gray-200">
				<div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
					<div class="text-sm text-gray-500">
						<p>Diterbitkan pada {formatDate(news.created_at)}</p>
						{#if news.updated_at !== news.created_at}
							<p>Diperbarui pada {formatDate(news.updated_at)}</p>
						{/if}
					</div>
					<button
						onclick={() => goto('/news')}
						class="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
					>
						Kembali ke Berita
					</button>
				</div>
			</footer>
		</article>
	{/if}
</div>
