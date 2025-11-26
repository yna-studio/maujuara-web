<script lang="ts">
	import { page } from '$app/stores';

	$: isCompetitions = $page.url.pathname.startsWith('/competitions');
	$: isNews = $page.url.pathname.startsWith('/news');
	$: isOrganizers = $page.url.pathname.startsWith('/organizers');

	let isMenuOpen = false;

	const toggleMenu = () => {
		isMenuOpen = !isMenuOpen;
	};
</script>

<header class="bg-white shadow-md">
	<nav class="w-full px-4 py-4 flex items-center justify-between sm:max-w-5xl sm:mx-auto">
		<!-- Logo -->
		<a href="/" class="flex items-center space-x-3">
			<img
				src="/images/Mau%20Juara%20-%20landscape.svg"
				alt="MJUR Logo"
				class="h-8 sm:h-9 w-auto"
			/>
		</a>

		<!-- Desktop Navigation Links -->
		<div class="hidden sm:flex items-center space-x-6">
			<a
				href="/competitions"
				class={`font-medium transition-colors duration-200 ${
					isCompetitions ? 'text-red-600' : 'text-gray-700 hover:text-red-600'
				}`}
			>
				Competitions
			</a>
			<a
				href="/organizers"
				class={`font-medium transition-colors duration-200 ${
					isOrganizers ? 'text-red-600' : 'text-gray-700 hover:text-red-600'
				}`}
			>
				Organizers
			</a>
			<a
				href="/news"
				class={`font-medium transition-colors duration-200 ${
					isNews ? 'text-red-600' : 'text-gray-700 hover:text-red-600'
				}`}
			>
				News
			</a>
		</div>

		<!-- Mobile Hamburger Button -->
		<button
			type="button"
			class="sm:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-red-600 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
			aria-label="Toggle navigation"
			on:click={toggleMenu}
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="h-6 w-6"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
				stroke-width="2"
			>
				{#if isMenuOpen}
					<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
				{:else}
					<path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
				{/if}
			</svg>
		</button>
	</nav>

	<!-- Mobile Navigation Menu -->
	{#if isMenuOpen}
		<nav class="sm:hidden border-t border-gray-100">
			<div class="px-4 pt-2 pb-4 space-y-1 max-w-5xl mx-auto">
				<a
					href="/competitions"
					class={`block py-2 text-base font-medium ${
						isCompetitions ? 'text-red-600' : 'text-gray-700 hover:text-red-600'
					}`}
				>
					Competitions
				</a>
				<a
					href="/organizers"
					class={`block py-2 text-base font-medium ${
						isOrganizers ? 'text-red-600' : 'text-gray-700 hover:text-red-600'
					}`}
				>
					Organizers
				</a>
				<a
					href="/news"
					class={`block py-2 text-base font-medium ${
						isNews ? 'text-red-600' : 'text-gray-700 hover:text-red-600'
					}`}
				>
					News
				</a>
			</div>
		</nav>
	{/if}
</header>


