import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async () => {
    const organizers = [
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

    return json({
        data: organizers,
        status: 200
    });
};
