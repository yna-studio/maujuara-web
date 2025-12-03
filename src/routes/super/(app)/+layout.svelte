<script lang="ts">
	export let data;
	let sidebarOpen = false;
</script>

<div class="min-h-screen bg-gray-50">
	<!-- Always-visible hamburger button -->
	{#if data.user}
		<button
			type="button"
			class="fixed top-4 left-4 z-50 inline-flex items-center justify-center rounded-md bg-white p-2 text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
			on:click={() => (sidebarOpen = !sidebarOpen)}
		>
			<span>☰</span>
		</button>
	{/if}

	{#if data.user && sidebarOpen}
		<aside
			class="fixed top-0 left-0 z-40 h-full w-64 bg-white border-r border-gray-200 flex flex-col"
		>
			<div class="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
				<div style="padding-left:35px">
					<h1 class="text-lg font-semibold text-gray-900">Super Admin</h1>
					<p class="text-xs text-gray-500 mt-1">Logged in as {data.user.name}</p>
				</div>
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

	<main class={`p-6 transition-all duration-200 ${sidebarOpen ? 'ml-0 md:ml-64' : 'ml-0'}`}>
		<slot />
	</main>
</div>
