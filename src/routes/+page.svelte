<script lang="ts">
	import CompetitionCard from '$lib/components/CompetitionCard.svelte';
	import Subtitle from '$lib/components/Subtitle.svelte';
	import Button from '$lib/components/Button.svelte';

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

	const competitions: Competition[] = [
		{
			id: '673b1c2a9d5f1a0b2c3d4e01',
			poster: '🎨',
			title: 'Lomba Desain Grafis Digital 2025',
			endDate: '15 Desember 2025',
			organizer: 'Kreatif Indonesia',
			prize: 'Rp 25.000.000',
			category: 'Desain',
			status: 'progress'
		},
		{
			id: '673b1c2a9d5f1a0b2c3d4e02',
			poster: '📸',
			title: 'Kompetisi Fotografi Landscape',
			endDate: '20 Desember 2025',
			organizer: 'Fotografi Nusantara',
			prize: 'Rp 15.000.000',
			category: 'Fotografi',
			status: 'closed'
		},
		{
			id: '673b1c2a9d5f1a0b2c3d4e03',
			poster: '✍️',
			title: 'Lomba Menulis Cerita Pendek',
			endDate: '10 Januari 2026',
			organizer: 'Sastra Indonesia',
			prize: 'Rp 20.000.000',
			category: 'Sastra',
			status: 'progress'
		},
		{
			id: '673b1c2a9d5f1a0b2c3d4e04',
			poster: '🎬',
			title: 'Kompetisi Video Kreatif Pendek',
			endDate: '5 Januari 2026',
			organizer: 'Media Kreatif',
			prize: 'Rp 30.000.000',
			category: 'Video',
			status: 'ended'
		},
		{
			id: '673b1c2a9d5f1a0b2c3d4e05',
			poster: '🎵',
			title: 'Lomba Musik Indie Indonesia',
			endDate: '25 Desember 2025',
			organizer: 'Musik Nusantara',
			prize: 'Rp 35.000.000',
			category: 'Musik',
			status: 'closed'
		},
		{
			id: '673b1c2a9d5f1a0b2c3d4e06',
			poster: '💻',
			title: 'Hackathon Aplikasi Mobile',
			endDate: '12 Januari 2026',
			organizer: 'Tech Indonesia',
			prize: 'Rp 50.000.000',
			category: 'Teknologi',
			status: 'progress'
		},
		{
			id: '673b1c2a9d5f1a0b2c3d4e07',
			poster: '🎭',
			title: 'Kompetisi Teater Digital',
			endDate: '8 Januari 2026',
			organizer: 'Seni Pertunjukan',
			prize: 'Rp 18.000.000',
			category: 'Teater',
			status: 'ended'
		},
		{
			id: '673b1c2a9d5f1a0b2c3d4e08',
			poster: '🍳',
			title: 'Lomba Masak Kreatif Online',
			endDate: '30 Desember 2025',
			organizer: 'Kuliner Indonesia',
			prize: 'Rp 22.000.000',
			category: 'Kuliner',
			status: 'progress'
		},
		{
			id: '673b1c2a9d5f1a0b2c3d4e09',
			poster: '🏃',
			title: 'Virtual Run Challenge 2025',
			endDate: '31 Desember 2025',
			organizer: 'Olahraga Digital',
			prize: 'Rp 12.000.000',
			category: 'Olahraga',
			status: 'ended'
		}
	];
</script>

<div class="container mx-auto px-4 py-16">
	<div class="max-w-4xl mx-auto text-center mb-16">
		<div class="bg-red-50 rounded-lg p-8 shadow-lg">
			<p class="text-gray-700 leading-relaxed">
				Ikuti beragam lomba online/offline yang bisa di temukan disini, dan menangkan hadianya.
			</p>
		</div>
	</div>

	<!-- Lomba Terbaru Section -->
	<section class="mb-16">
		<Subtitle text="Lomba Terbaru" subtext="Lomba terbaru yang bisa di ikuti" />
		
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			{#each competitions as competition}
				<CompetitionCard {competition} status={competition.status} id={competition.id} />
			{/each}
		</div>

		<div class="mt-10 flex justify-center">
			<Button text="Lomba Lainnya" type="link" href="/competitions" variant="large" size="auto" />
		</div>
	</section>
</div>


