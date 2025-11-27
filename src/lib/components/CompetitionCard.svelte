<script lang="ts">
	export let competition;
	export let status: 'open' | 'progress' | 'ended' = 'open';

	const slugify = (value: string) =>
		value
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-+|-+$/g, '');

	const detailPath = `/competitions/detail/${slugify(`${competition.title}-${competition._id}`)}`;
	
	// Format date for display
	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleDateString('id-ID', { 
			day: 'numeric', 
			month: 'long', 
			year: 'numeric' 
		});
	};
	
	// Calculate status based on dates if not provided
	const calculateStatus = () => {
		const now = new Date();
		const deadline = new Date(competition.deadline_date);
		const announcement = new Date(competition.announcement_date);
		
		if (now < deadline) return 'open';
		if (now >= deadline && now < announcement) return 'progress';
		return 'ended';
	};
	
	const currentStatus = status || competition.status || 'open';
	
	// Format prize
	const formatPrize = () => {
		if (competition.prize_estimate) {
			return new Intl.NumberFormat('id-ID', {
				style: 'currency',
				currency: 'IDR',
				minimumFractionDigits: 0
			}).format(competition.prize_estimate);
		}
		return competition.prize_desc || 'Tidak tersedia';
	};
</script>

<a
	href={detailPath}
	class="block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 relative focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
>
	<!-- Status Badge -->
	<div class="absolute top-3 left-3 z-10">
		{#if currentStatus === 'open'}
			<span class="inline-block bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-lg">
				open
			</span>
		{:else if currentStatus === 'progress'}
			<span class="inline-block bg-gray-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-lg">
				Berlangsung
			</span>
		{:else if currentStatus === 'ended'}
			<span class="inline-block bg-red-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-lg">
				Berakhir
			</span>
		{/if}
	</div>

	<!-- Poster with Background Image -->
	<div class="relative w-full h-64 overflow-hidden bg-gray-200">
		<!-- Background Image -->
		<div 
			class="absolute inset-0 bg-cover bg-center"
			style="background-image: url('{competition.poster || 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1131&q=80'}');"
		>
			<!-- Gradient Overlay -->
			<div class="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
			
		</div>
	</div>

	<!-- Card Content -->
	<div class="p-5">
		<!-- Category Badge -->
		{#if competition.category?.name}
			<span class="inline-block bg-gray-100 text-gray-700 text-xs font-semibold px-3 py-1 rounded-full mb-3">
				{competition.category.name}
			</span>
		{/if}

		<!-- Title -->
		<h3 class="text-lg font-bold text-gray-900 mb-3 line-clamp-2">
			{competition.title}
		</h3>

		<!-- Organizer -->
		<div class="flex items-center mb-2">
			{#if competition.organizer?.avatar}
				<img 
					src={competition.organizer.avatar} 
					alt={competition.organizer.name}
					class="w-6 h-6 rounded-full mr-2 object-cover"
				/>
			{:else}
				<svg class="w-4 h-4 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
				</svg>
			{/if}
			<span class="text-sm text-gray-600">{competition.organizer?.name || 'Unknown'}</span>
		</div>

		<!-- End Date -->
		<div class="flex items-center mb-2">
			<svg class="w-4 h-4 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
			</svg>
			<span class="text-sm text-gray-600">Berakhir: {formatDate(competition.deadline_date)}</span>
		</div>

		<!-- Announcement Date -->
		<div class="flex items-center mb-3">
			<svg class="w-4 h-4 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
			</svg>
			<span class="text-sm text-gray-600">Pengumuman: {formatDate(competition.announcement_date)}</span>
		</div>

		<!-- Prize -->
		<div class="pt-3 border-t border-gray-200">
			<p class="text-sm text-gray-500 mb-1">Total Hadiah</p>
			<p class="text-lg font-bold text-green-600">{formatPrize()}</p>
		</div>
	</div>
</a>

