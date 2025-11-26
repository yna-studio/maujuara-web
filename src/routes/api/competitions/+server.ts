import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ url }) => {
    const limit = url.searchParams.get('limit');
    const category = url.searchParams.get('category');
    const status = url.searchParams.get('status');
    
    let competitions = [
        {
            id: "1",
            poster: "🎨",
            title: "Lomba Desain Grafis Digital 2025",
            endDate: "15 Desember 2025",
            organizer: "Kreatif Indonesia",
            prize: "Rp 25.000.000",
            category: "Desain",
            status: "progress",
        },
        {
            id: "2",
            poster: "📸",
            title: "Kompetisi Fotografi Landscape",
            endDate: "20 Desember 2025",
            organizer: "Fotografi Nusantara",
            prize: "Rp 15.000.000",
            category: "Fotografi",
            status: "progress",
        },
        {
            id: "3",
            poster: "💻",
            title: "Hackathon Nasional 2025",
            endDate: "10 Januari 2026",
            organizer: "Tech Indonesia",
            prize: "Rp 50.000.000",
            category: "Teknologi",
            status: "progress",
        },
        {
            id: "4",
            poster: "🎭",
            title: "Lomba Teater Remaja",
            endDate: "5 Desember 2025",
            organizer: "Seni Budaya Nusantara",
            prize: "Rp 10.000.000",
            category: "Seni Pertunjukan",
            status: "progress",
        },
        {
            id: "5",
            poster: "🎵",
            title: "Festival Musik Indie 2025",
            endDate: "18 Desember 2025",
            organizer: "Musik Indonesia",
            prize: "Rp 30.000.000",
            category: "Musik",
            status: "progress",
        },
        {
            id: "6",
            poster: "✍️",
            title: "Lomba Menulis Cerpen Nasional",
            endDate: "25 Desember 2025",
            organizer: "Sastra Nusantara",
            prize: "Rp 20.000.000",
            category: "Sastra",
            status: "progress",
        },
        {
            id: "7",
            poster: "🎬",
            title: "Kompetisi Film Pendek",
            endDate: "30 Desember 2025",
            organizer: "Film Muda Indonesia",
            prize: "Rp 35.000.000",
            category: "Film",
            status: "progress",
        },
        {
            id: "8",
            poster: "🏃",
            title: "Marathon Jakarta 2025",
            endDate: "22 Desember 2025",
            organizer: "Run Indonesia",
            prize: "Rp 15.000.000",
            category: "Olahraga",
            status: "progress",
        },
        {
            id: "9",
            poster: "🎯",
            title: "Kompetisi E-sport Nasional",
            endDate: "28 Desember 2025",
            organizer: "E-sport Indonesia",
            prize: "Rp 40.000.000",
            category: "E-sport",
            status: "progress",
        },
        {
            id: "10",
            poster: "🍳",
            title: "MasterChef Junior Indonesia",
            endDate: "12 Januari 2026",
            organizer: "Culinary Indonesia",
            prize: "Rp 25.000.000",
            category: "Kuliner",
            status: "progress",
        }
    ];

    // Filter by category if provided
    if (category) {
        competitions = competitions.filter(comp => 
            comp.category.toLowerCase() === category.toLowerCase()
        );
    }

    // Filter by status if provided
    if (status) {
        competitions = competitions.filter(comp => 
            comp.status.toLowerCase() === status.toLowerCase()
        );
    }

    // Apply limit if provided
    if (limit) {
        const limitNum = parseInt(limit);
        if (!isNaN(limitNum) && limitNum > 0) {
            competitions = competitions.slice(0, limitNum);
        }
    }

    return json({
        data: competitions,
        status: 200
    });
};
