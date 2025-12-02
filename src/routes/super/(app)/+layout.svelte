<script lang="ts">
	export let data;
</script>

<div class="min-h-screen flex bg-gray-50">
	{#if data.user}
		<aside class="w-64 bg-white border-r border-gray-200 shadow-sm flex flex-col">
			<div class="px-6 py-4 border-b border-gray-100">
				<h1 class="text-lg font-semibold text-gray-900">Super Admin</h1>
				<p class="text-xs text-gray-500 mt-1">Logged in as {data.user.name}</p>
			</div>

			<nav class="flex-1 px-4 py-4 space-y-1 text-sm">
				<a
					href="/super/dashboard"
					class="block rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
				>
					Dashboard
				</a>

				<div class="mt-4">
					<p class="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
						Competitions
					</p>
					<a
						href="/super/competitions/create"
						class="block rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
					>
						Create
					</a>
					<a
						href="/super/competitions"
						class="block rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
					>
						All competitions
					</a>
				</div>
			</nav>
		</aside>
	{/if}

	<main class="flex-1 p-6">
		<slot />
	</main>
</div>
