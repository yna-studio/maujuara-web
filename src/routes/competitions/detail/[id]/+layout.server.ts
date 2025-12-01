import type { LayoutServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

export const load: LayoutServerLoad = async ({ params, parent }) => {
    try {
        // Get competition ID from URL
        const idFromUrl = params.id;
        if (!idFromUrl) {
            throw error(404, 'ID kompetisi tidak ditemukan');
        }
        
        // Extract actual ID from slug (format: name-id)
        const competitionId = idFromUrl.split('-')[idFromUrl.split('-').length - 1];
        
        // For server-side requests, we need the full URL
        const host = env.PUBLIC_HOST || 'http://localhost:20251';
        const endpoint = `${host}/api/competitions/${competitionId}`;
        
        // Fetch competition data on server
        const response = await fetch(endpoint);
        
        if (!response.ok) {
            if (response.status === 404) {
                throw error(404, 'Kompetisi tidak ditemukan');
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (!result.data) {
            throw error(404, 'Kompetisi tidak ditemukan');
        }
        
        const competition = result.data;
        
        // Generate SEO metadata
        const title = competition.title || 'Kompetisi Detail';
        const description = competition.desc ? 
            competition.desc.replace(/<[^>]*>/g, '').substring(0, 160) + '...' : 
            'Temukan informasi lengkap tentang kompetisi ini, termasuk hadiah, deadline, dan cara pendaftaran.';
        
        const currentUrl = `${host}/competitions/detail/${idFromUrl}`;
        
        return {
            competition,
            seo: {
                title,
                description,
                url: currentUrl,
                image: competition.poster,
                type: 'article',
                siteName: 'Maujuara',
                author: competition.organizer?.name || 'Maujuara',
                publishedTime: competition.created_date,
                modifiedTime: competition.updated_date,
                category: competition.category?.name || 'Kompetisi'
            }
        };
    } catch (err) {
        console.error('Failed to fetch competition on server:', err);
        
        // Return error state for client-side handling
        return {
            competition: null,
            seo: {
                title: 'Kompetisi Tidak Ditemukan',
                description: 'Kompetisi yang Anda cari tidak tersedia atau telah dihapus.',
                url: '',
                image: '',
                type: 'website',
                siteName: 'Maujuara',
                author: 'Maujuara',
                publishedTime: '',
                modifiedTime: '',
                category: ''
            }
        };
    }
};
