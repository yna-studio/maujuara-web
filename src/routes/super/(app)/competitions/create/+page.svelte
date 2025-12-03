<script lang="ts">
	import CompetitionForm from '$lib/components/CompetitionForm.svelte';

	export let data;
	const { categories, organizers } = data;
</script>

<CompetitionForm 
	{categories} 
	{organizers}
/>

<style>
	:global(body) {
		background-color: #f9fafb;
	}
</style>
