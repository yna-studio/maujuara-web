<script lang="ts">
	export let news;

	const slugify = (value: string) => {
		return value
			.toLowerCase()
			.replace(/[^\w\s-]/g, '')
			.replace(/[\s_-]+/g, '-')
			.replace(/^-+|-+$/g, '');
	};

	function formatDate(dateString: string): string {
		const date = new Date(dateString);
		return date.toLocaleDateString('id-ID', {
			day: 'numeric',
			month: 'long',
			year: 'numeric'
		});
	}

	function truncateText(text: string, maxLength: number): string {
		if (text.length <= maxLength) return text;
		return text.substring(0, maxLength) + '...';
	}

	// Generate detail page URL with slug format
	$: detailPath = `/news/detail/${slugify(news.title)}-${news._id}`;
	
	// Handle different data structures for news ID
	const newsId = news._id || news.id;
</script>

<a
	href={detailPath}
	class="block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 relative focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
>
	<!-- Thumbnail with Background Image -->
	<div class="relative w-full h-48 overflow-hidden bg-gray-200">
		<!-- Background Image -->
		<div 
			class="absolute inset-0 bg-cover bg-center"
			style="background-image: url('{news.thumbnail || 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1172&q=80'}');"
		>
			<!-- Gradient Overlay -->
			<div class="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
			
		</div>
	</div>

	<!-- Card Content -->
	<div class="p-5">
		<!-- Title -->
		<h3 class="text-lg font-bold text-gray-900 mb-3 line-clamp-2">
			{news.title}
		</h3>

		<!-- Tags -->
		{#if news.tags && news.tags.length > 0}
			<div class="flex flex-wrap gap-2 mb-3">
				{#each news.tags as tag}
					<span class="inline-block bg-gray-100 text-gray-700 text-xs font-semibold px-3 py-1 rounded-full">
						#{tag}
					</span>
				{/each}
			</div>
		{/if}

		<!-- Created By -->
		<div class="flex items-center mb-2">
			{#if news.createdBy?.avatar}
				<img 
					src={news.createdBy.avatar} 
					alt={news.createdBy.name}
					class="w-6 h-6 rounded-full mr-2 object-cover"
					loading="lazy"
					decoding="async"
				/>
			{:else}
				<svg class="w-4 h-4 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
				</svg>
			{/if}
			<span class="text-sm text-gray-600">{news.createdBy?.name || news.created_by || 'Maujuara Team'}</span>
		</div>

		<!-- Created At -->
		<div class="flex items-center mb-3">
			<svg class="w-4 h-4 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
			</svg>
			<span class="text-sm text-gray-600">{formatDate(news.created_at)}</span>
		</div>

		<!-- Short Description -->
		<div class="py-3 border-t border-gray-200">
			<p class="text-sm text-gray-700 line-clamp-3">
				{truncateText(news.shortDesc || news.short_desc || news.description || '', 120)}
			</p>
		</div>
		
		<!-- Read More -->
		<div class="pt-3 border-t border-gray-200">
			<div class="flex items-center justify-between">
				<span class="text-sm font-medium text-red-600 hover:text-red-700">
					Baca selengkapnya
				</span>
				<svg class="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
				</svg>
			</div>
		</div>
	</div>
</a>
