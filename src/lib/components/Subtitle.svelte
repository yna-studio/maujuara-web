<script>
	export let text;
	export let subtext = '';
</script>

<div class="mb-12 text-left">
	<h2 class="text-4xl font-bold text-gray-900 mb-2">
		{text}
	</h2>
	{#if subtext}
		<p class="text-sm text-gray-600">
			{subtext}
		</p>
	{/if}
</div>

