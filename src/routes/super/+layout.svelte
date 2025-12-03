<script lang="ts">
	import SessionSpinner from '$lib/components/SessionSpinner.svelte';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	export let data;

	onMount(() => {
		// If user is logged in and on the login page, redirect to dashboard
		if (data?.user && data.user._id && window.location.pathname === '/super') {
			goto('/super/dashboard', { replaceState: true });
		}
	});
</script>

{#if data === undefined || data.loading === undefined}
	<SessionSpinner />
{:else}
	<div class="min-h-screen bg-gray-50">
		<slot />
	</div>
{/if}
