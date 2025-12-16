<script lang="ts">
	import CompetitionCard from '$lib/components/CompetitionCard.svelte';
	import Subtitle from '$lib/components/Subtitle.svelte';
	import Button from '$lib/components/Button.svelte';
	import OrganizerList from '$lib/components/OrganizerList.svelte';
	import Spinner from '$lib/components/Spinner.svelte';
	import type { Organizer } from '$lib/routes/api/organizers/$types';
	import type { PageData } from './$types';

	type Stat = {
		label: string;
		value: string;
		href?: string;
	};

	type Competition = {
		id: string;
		poster: string;
		title: string;
		endDate: string;
		organizer: string;
		prize: string;
		category: string;
		status: string;
	};

	export let data: PageData;

	let competitions: Competition[] = data.competitions ?? [];
	let organizers: Organizer[] = data.organizers ?? [];
	let tags: any[] = data.tags ?? [];
	let stats: Stat[] = [];
	let loading = false;
	let error: string | null = data.error;

	// Format number for display
	const formatNumber = (num: number): string => {
		if (num >= 1000000) {
			return (num / 1000000).toFixed(1) + 'M';
		} else if (num >= 1000) {
			return (num / 1000).toFixed(1) + 'K';
		}
		return num.toString();
	};

	// Format currency for display
	const formatCurrency = (num: number): string => {
		if (num >= 1000000000000) {
			return 'Rp ' + (num / 1000000000000).toFixed(1) + 'T';
		} else if (num >= 1000000000) {
			return 'Rp ' + (num / 1000000000).toFixed(1) + 'M';
		} else if (num >= 1000000) {
			return 'Rp ' + (num / 1000000).toFixed(1) + 'JT';
		} else if (num >= 1000) {
			return 'Rp ' + (num / 1000).toFixed(1) + 'RB';
		}
		return 'Rp ' + num.toString();
	};

	// Derive stats from server data
	if (data.statsRaw) {
		stats = [
			{ 
				label: 'Kompetisi Aktif', 
				value: formatNumber(data.statsRaw.active_competition), 
				href: '/competitions?status=progress' 
			},
			{ 
				label: 'Total Kompetisi', 
				value: formatNumber(data.statsRaw.total_competition), 
				href: '/competitions' 
			},
			{ 
				label: 'Verified Organizers', 
				value: formatNumber(data.statsRaw.total_organizers) 
			},
			{ 
				label: 'Hadiah Tahun Ini', 
				value: formatCurrency(data.statsRaw.prize_this_year) 
			}
		];
	}
</script>

<div class="max-w-5xl mx-auto px-4 py-16">
	{#if loading}
		<div class="mb-12">
			<div class="mb-6">
				<h2 class="text-xl font-bold text-gray-900">Organizers Terbaru</h2>
			</div>
			<div class="flex justify-center py-8">
				<Spinner size="large" color="primary" />
			</div>
		</div>
	{:else if error}
		<div class="mb-12">
			<div class="mb-6">
				<h2 class="text-xl font-bold text-gray-900">Organizers Terbaru</h2>
			</div>
			<div class="text-center py-8">
				<p class="text-red-600 mb-4">{error}</p>
				<button 
					on:click={() => window.location.reload()} 
					class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
				>
					Retry
				</button>
			</div>
		</div>
	{:else}
		<OrganizerList {organizers} title="Organizers Terbaru" />
	{/if}

	<div class="max-w-4xl mx-auto text-center mb-16">
		<div class="bg-red-50 rounded-lg p-8 shadow-lg">
			<p class="text-gray-700 leading-relaxed mb-4">
				Kamu ingin mengikuti kompetisi-kompetisi online dan memenangkan hadiah? Silahkan klik di sini
				<a href="/competitions" class="font-semibold text-red-600 hover:underline">Ikuti Kompetisi</a>.
			</p>
			<p class="text-gray-700 leading-relaxed">
				Atau kamu sebagai penyelenggara kompetisi ingin agar kompetisi kamu makin ramai?
				<a href="/add-competition" class="font-semibold text-red-600 hover:underline">Pasang di sini</a>.
			</p>
		</div>
	</div>

	<section class="mb-16">
		<div class="grid grid-cols-2 md:grid-cols-4 gap-6">
			{#each stats as stat}
				{#if stat.href}
					<a
						href={stat.href}
						class="bg-white border border-gray-200 rounded-xl p-6 text-center shadow-sm transition-shadow duration-200 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
					>
						<p class="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-2">
							{stat.label}
						</p>
						<p class="text-3xl font-bold text-gray-900">
							{stat.value}
						</p>
					</a>
				{:else}
					<div class="bg-white border border-gray-200 rounded-xl p-6 text-center shadow-sm">
						<p class="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-2">
							{stat.label}
						</p>
						<p class="text-3xl font-bold text-gray-900">
							{stat.value}
						</p>
					</div>
				{/if}
			{/each}
		</div>
	</section>

	<!-- Tags Section -->
	{#if tags && tags.length > 0}
		<section class="mb-16">
			<div class="text-center mb-8">
				<h2 class="text-2xl font-bold text-gray-900 mb-2">Topik Populer</h2>
				<p class="text-gray-600">Temukan kompetisi berdasarkan topik yang kamu minati</p>
			</div>
			<div class="flex flex-wrap justify-center gap-3">
				{#each tags as tag}
					<a
						href="/competitions?tag={tag.name}"
						class="inline-flex items-center px-4 py-2 bg-white border border-gray-400 text-black text-sm font-medium rounded-full hover:bg-gray-50 hover:border-gray-500 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
					>
						{tag.name}
						<span class="ml-2 text-xs text-gray-500">({tag.total})</span>
					</a>
				{/each}
			</div>
			<!-- <div class="text-center mt-6">
				<a
					href="/competitions"
					class="text-red-600 hover:text-red-700 font-medium text-sm"
				>
					View all tags →
				</a>
			</div> -->
		</section>
	{/if}

	<!-- Kompetisi Terbaru Section -->
	<section class="mb-16">
		<Subtitle text="Kompetisi Terbaru" subtext="Kompetisi terbaru yang bisa di ikuti" />
		
		{#if loading}
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{#each Array(9) as _}
					<div class="bg-gray-100 rounded-xl p-6 animate-pulse">
						<div class="h-8 bg-gray-200 rounded mb-4"></div>
						<div class="h-4 bg-gray-200 rounded mb-2"></div>
						<div class="h-4 bg-gray-200 rounded w-3/4"></div>
					</div>
				{/each}
			</div>
		{:else if error}
			<div class="text-center py-12">
				<p class="text-red-600 mb-4">{error}</p>
				<button 
					on:click={() => window.location.reload()} 
					class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
				>
					Retry
				</button>
			</div>
		{:else}
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{#each competitions as competition}
					<CompetitionCard {competition} status={competition.status as 'open' | 'progress' | 'ended'} />
				{/each}
			</div>
		{/if}

		<div class="mt-10 flex justify-center">
			{#if !loading && !error}
				<Button text="Kompetisi Lainnya" type="link" href="/competitions" variant="large" size="auto" />
			{/if}
		</div>
	</section>
</div>


