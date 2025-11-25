<script lang="ts">
	export let competition;
	export let status: 'progress' | 'ended' | 'closed' = 'progress';
	export let id: string;

	const slugify = (value: string) =>
		value
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-+|-+$/g, '');

	const detailPath = `/competitions/detail/${slugify(`${competition.title}-${id}`)}`;
</script>

<a
	href={detailPath}
	class="block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 relative focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
>
	<!-- Status Badge -->
	<div class="absolute top-3 left-3 z-10">
		{#if status === 'progress'}
			<span class="inline-block bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-lg">
				Open
			</span>
		{:else if status === 'ended'}
			<span class="inline-block bg-gray-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-lg">
				Berakhir
			</span>
		{:else if status === 'closed'}
			<span class="inline-block bg-orange-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-lg">
				Berlangsung
			</span>
		{/if}
	</div>

	<!-- Poster -->
	<div class="w-full h-48 bg-red-500 flex items-center justify-center">
		<span class="text-white text-4xl font-bold">{competition.poster}</span>
	</div>

	<!-- Card Content -->
	<div class="p-5">
		<!-- Category Badge -->
		<span class="inline-block bg-gray-100 text-gray-700 text-xs font-semibold px-3 py-1 rounded-full mb-3">
			{competition.category}
		</span>

		<!-- Title -->
		<h3 class="text-lg font-bold text-gray-900 mb-3 line-clamp-2">
			{competition.title}
		</h3>

		<!-- Organizer -->
		<div class="flex items-center mb-2">
			<svg class="w-4 h-4 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
			</svg>
			<span class="text-sm text-gray-600">{competition.organizer}</span>
		</div>

		<!-- End Date -->
		<div class="flex items-center mb-3">
			<svg class="w-4 h-4 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
			</svg>
			<span class="text-sm text-gray-600">Berakhir: {competition.endDate}</span>
		</div>

		<!-- Prize -->
		<div class="pt-3 border-t border-gray-200">
			<p class="text-sm text-gray-500 mb-1">Total Hadiah</p>
			<p class="text-lg font-bold text-green-600">{competition.prize}</p>
		</div>
	</div>
</a>

