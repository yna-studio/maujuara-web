<script lang="ts">
	import CompetitionForm from '$lib/components/CompetitionForm.svelte';
	import type { PageData } from './$types';

	export let data: PageData;
	export let form;
</script>

<section class="space-y-6">
	<div class="flex items-center justify-between">
		<h1 class="text-2xl font-bold text-gray-900">Edit Competition</h1>
		<a
			href="/super/competitions"
			class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
		>
			← Back to competitions
		</a>
	</div>

	{#if form?.success}
		<div class="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-md">
			{form.success}
		</div>
	{/if}

	{#if form?.error}
		<div class="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md">
			{form.error}
		</div>
	{/if}

	<CompetitionForm 
		competition={data.competition}
		categories={data.categories}
		organizers={data.organizers}
		{form}
	/>
</section>
