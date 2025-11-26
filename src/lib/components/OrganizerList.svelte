<script lang="ts" context="module">
	export interface Organizer {
		id: string;
		name: string;
		logo: string;
		image: string;
	}
</script>

<script lang="ts">
	export let organizers: Organizer[] = [];
	export let title: string = 'Verified Organizers';
</script>

<section class="mb-12">
	<div class="mb-6">
		<h2 class="text-xl font-bold text-gray-900">{title}</h2>
	</div>
	<div class="flex items-start gap-3 overflow-x-auto pb-4 snap-x snap-mandatory">
		{#each organizers as organizer}
			<a
				href={`/competitions?organizer=${organizer.id}`}
				class="flex flex-col items-center min-w-[110px] snap-start focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
			>
				<div
					class="w-24 h-24 rounded-full border-[6px] border-red-500 bg-center bg-cover bg-no-repeat shadow-sm"
					style={`background-image: url('${organizer.image}')`}
				>
				</div>
				<p class="mt-2 text-sm font-medium text-gray-700 text-center line-clamp-2">
					{organizer.name}
				</p>
			</a>
		{/each}
	</div>
</section>
