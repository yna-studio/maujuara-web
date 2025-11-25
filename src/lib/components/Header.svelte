<script lang="ts">
	import { page } from '$app/stores';

	$: isCompetitions = $page.url.pathname.startsWith('/competitions');
	$: isNews = $page.url.pathname.startsWith('/news');
</script>

<header class="bg-white shadow-md">
	<nav class="container mx-auto px-4 py-4 flex items-center justify-between">
		<!-- Logo -->
		<a href="/" class="flex items-center space-x-3">
			<div class="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center shadow-lg">
				<span class="text-white font-bold text-xl">MJ</span>
			</div>
			<span class="text-2xl font-bold text-gray-800">MauJuara</span>
		</a>

		<!-- Navigation Links -->
		<div class="flex items-center space-x-6">
			<a
				href="/competitions"
				class={`font-medium transition-colors duration-200 ${
					isCompetitions ? 'text-red-600' : 'text-gray-700 hover:text-red-600'
				}`}
			>
				Competitions
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
	</nav>
</header>


