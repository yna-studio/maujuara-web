<script lang="ts">
	import { onMount } from 'svelte';
	import CompetitionCard from '$lib/components/CompetitionCard.svelte';
	import Subtitle from '$lib/components/Subtitle.svelte';
	import Button from '$lib/components/Button.svelte';
	import OrganizerList from '$lib/components/OrganizerList.svelte';
	import Spinner from '$lib/components/Spinner.svelte';
	import { CompetitionsAPI } from '$lib/api/competitions';
	import { OrganizersAPI } from '$lib/api/organizers';
	import type { Organizer } from '$routes/api/organizers/$types';

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
		status: 'progress' | 'ended' | 'closed';
	};

	let competitions: Competition[] = [];
	let organizers: Organizer[] = [];
	let loading = true;
	let error: string | null = null;

	// Fetch data from APIs
	onMount(async () => {
		try {
			const [competitionsResponse, organizersResponse] = await Promise.all([
				CompetitionsAPI.getCompetitions(9),
				OrganizersAPI.getOrganizers()
			]);
			competitions = competitionsResponse.data;
			organizers = organizersResponse.data;
		} catch (err) {
			console.error('Failed to fetch data:', err);
			error = 'Failed to load data';
		} finally {
			loading = false;
		}
	});

	const stats: Stat[] = [
		{ label: 'Active Competition', value: '34', href: '/competitions?status=active' },
		{ label: 'Total Competition', value: '200K', href: '/competitions' },
		{ label: 'Verified Organizers', value: '1.5K' },
		{ label: 'Total Prize Pool', value: 'Rp 5B' }
	];
</script>

<div class="max-w-5xl mx-auto px-4 py-16">
	{#if loading}
		<div class="mb-12">
			<div class="mb-6">
				<h2 class="text-xl font-bold text-gray-900">Latest Organizers Posted</h2>
			</div>
			<div class="flex justify-center py-8">
				<Spinner size="large" color="primary" />
			</div>
		</div>
	{:else if error}
		<div class="mb-12">
			<div class="mb-6">
				<h2 class="text-xl font-bold text-gray-900">Latest Organizers Posted</h2>
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
		<OrganizerList {organizers} title="Latest Organizers Posted" />
	{/if}

	<div class="max-w-4xl mx-auto text-center mb-16">
		<div class="bg-red-50 rounded-lg p-8 shadow-lg">
			<p class="text-gray-700 leading-relaxed mb-4">
				Kamu ingin mengikuti lomba-lomba online dan memenangkan hadiah? Silahkan klik di sini
				<a href="/competitions" class="font-semibold text-red-600 hover:underline">Ikuti Kompetisi</a>.
			</p>
			<p class="text-gray-700 leading-relaxed">
				Atau kamu sebagai penyelenggara kompetisi ingin agar lomba kamu makin ramai?
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

	<!-- Lomba Terbaru Section -->
	<section class="mb-16">
		<Subtitle text="Lomba Terbaru" subtext="Lomba terbaru yang bisa di ikuti" />
		
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
					<CompetitionCard {competition} status={competition.status} id={competition.id} />
				{/each}
			</div>
		{/if}

		<div class="mt-10 flex justify-center">
			{#if !loading && !error}
				<Button text="Lomba Lainnya" type="link" href="/competitions" variant="large" size="auto" />
			{/if}
		</div>
	</section>
</div>


