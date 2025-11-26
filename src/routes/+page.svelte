<script lang="ts">
	import CompetitionCard from '$lib/components/CompetitionCard.svelte';
	import Subtitle from '$lib/components/Subtitle.svelte';
	import Button from '$lib/components/Button.svelte';

	type Organizer = {
		name: string;
		logo: string;
		id: string;
		image: string;
	};

	type Stat = {
		label: string;
		value: string;
		href?: string;
	};

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

	const stats: Stat[] = [
		{ label: 'Active Competition', value: '34', href: '/competitions?status=active' },
		{ label: 'Total Competition', value: '200K', href: '/competitions' },
		{ label: 'Verified Organizers', value: '1.5K' },
		{ label: 'Total Prize Pool', value: 'Rp 5B' }
	];

	const organizers: Organizer[] = [
		{ id: 'org001', name: 'Nusantara Art Lab', logo: '🎨', image: 'https://via.placeholder.com/160x160.png?text=NA' },
		{ id: 'org002', name: 'Lens Club', logo: '📸', image: 'https://via.placeholder.com/160x160.png?text=LC' },
		{ id: 'org003', name: 'Sastra ID', logo: '✍️', image: 'https://via.placeholder.com/160x160.png?text=SI' },
		{ id: 'org004', name: 'CineVerse', logo: '🎬', image: 'https://via.placeholder.com/160x160.png?text=CV' },
		{ id: 'org005', name: 'Indie Sound', logo: '🎵', image: 'https://via.placeholder.com/160x160.png?text=IS' },
		{ id: 'org006', name: 'Tech Forge', logo: '💻', image: 'https://via.placeholder.com/160x160.png?text=TF' },
		{ id: 'org007', name: 'StageCraft', logo: '🎭', image: 'https://via.placeholder.com/160x160.png?text=SC' },
		{ id: 'org008', name: 'Kuliner Pro', logo: '🍳', image: 'https://via.placeholder.com/160x160.png?text=KP' },
		{ id: 'org009', name: 'RunNation', logo: '🏃', image: 'https://via.placeholder.com/160x160.png?text=RN' },
		{ id: 'org010', name: 'EduSpark', logo: '📚', image: 'https://via.placeholder.com/160x160.png?text=ES' },
		{ id: 'org011', name: 'Digital Craft', logo: '🧵', image: 'https://via.placeholder.com/160x160.png?text=DC' },
		{ id: 'org012', name: 'Code Arena', logo: '👨‍💻', image: 'https://via.placeholder.com/160x160.png?text=CA' },
		{ id: 'org013', name: 'FotoKita', logo: '📷', image: 'https://via.placeholder.com/160x160.png?text=FK' },
		{ id: 'org014', name: 'GameVerse', logo: '🎮', image: 'https://via.placeholder.com/160x160.png?text=GV' },
		{ id: 'org015', name: 'Dance Nation', logo: '🕺', image: 'https://via.placeholder.com/160x160.png?text=DN' },
		{ id: 'org016', name: 'Startup Hub', logo: '🚀', image: 'https://via.placeholder.com/160x160.png?text=SH' },
		{ id: 'org017', name: 'Eco Warriors', logo: '🌿', image: 'https://via.placeholder.com/160x160.png?text=EW' },
		{ id: 'org018', name: 'Math League', logo: '➗', image: 'https://via.placeholder.com/160x160.png?text=ML' },
		{ id: 'org019', name: 'Science Lab', logo: '🔬', image: 'https://via.placeholder.com/160x160.png?text=SL' },
		{ id: 'org020', name: 'Fashion Hive', logo: '👗', image: 'https://via.placeholder.com/160x160.png?text=FH' },
		{ id: 'org021', name: 'Culinary House', logo: '🥐', image: 'https://via.placeholder.com/160x160.png?text=CH' },
		{ id: 'org022', name: 'Design Sprint', logo: '🖌️', image: 'https://via.placeholder.com/160x160.png?text=DS' },
		{ id: 'org023', name: 'Music Lab', logo: '🎹', image: 'https://via.placeholder.com/160x160.png?text=MLab' },
		{ id: 'org024', name: 'Film Studio', logo: '🎥', image: 'https://via.placeholder.com/160x160.png?text=FS' },
		{ id: 'org025', name: 'Sports Hub', logo: '⚽', image: 'https://via.placeholder.com/160x160.png?text=SP' }
	];
</script>

<div class="max-w-5xl mx-auto px-4 py-16">
	<section class="mb-12">
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

	<div class="max-w-4xl mx-auto text-center mb-16">
		<div class="bg-red-50 rounded-lg p-8 shadow-lg">
			<p class="text-gray-700 leading-relaxed mb-4">
				Kamu ingin mengikuti lomba-lomba online dan memenangkan hadiah? Silahkan klik di sini
				<a href="/competitions" class="font-semibold text-red-600 hover:underline">Ikuti Kompetisi</a>.
			</p>
			<p class="text-gray-700 leading-relaxed">
				Atau kamu sebagai penyelenggara kompetisi ingin agar lomba kamu makin ramai?
				<a href="/add-competition" class="font-semibold text-red-600 hover:underline">Pasang di sini</a>.
			</p>
		</div>
	</div>

	<section class="mb-16">
		<div class="grid grid-cols-2 md:grid-cols-4 gap-6">
			{#each stats as stat}
				{#if stat.href}
					<a
						href={stat.href}
						class="bg-white border border-gray-200 rounded-xl p-6 text-center shadow-sm transition-shadow duration-200 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
					>
						<p class="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-2">
							{stat.label}
						</p>
						<p class="text-3xl font-bold text-gray-900">
							{stat.value}
						</p>
					</a>
				{:else}
					<div class="bg-white border border-gray-200 rounded-xl p-6 text-center shadow-sm">
						<p class="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-2">
							{stat.label}
						</p>
						<p class="text-3xl font-bold text-gray-900">
							{stat.value}
						</p>
					</div>
				{/if}
			{/each}
		</div>
	</section>

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


