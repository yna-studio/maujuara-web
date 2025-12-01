import type { LayoutServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

export const load: LayoutServerLoad = async ({ params, parent }) => {
    // Get parent data (root layout SEO defaults)
    const parentData = await parent();
    
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
        
        // Generate SEO metadata (override defaults with competition-specific data)
        const title = competition?.title || parentData.seo.defaultTitle;
        const description = competition?.desc ? 
            competition.desc.replace(/<[^>]*>/g, '').substring(0, 160) + '...' : 
            parentData.seo.defaultDescription;
        
        const currentUrl = competition ? `${host}/competitions/detail/${idFromUrl}` : host;
        
        return {
            competition,
            seo: {
                title,
                description,
                url: currentUrl,
                image: competition?.poster || parentData.seo.defaultImage,
                type: competition ? 'article' : 'website',
                siteName: parentData.seo.siteName,
                author: competition?.organizer?.name || parentData.seo.siteName,
                publishedTime: competition?.created_date || '',
                modifiedTime: competition?.updated_date || '',
                category: competition?.category?.name || 'Kompetisi',
                twitterHandle: parentData.seo.twitterHandle,
                host: parentData.seo.host
            }
        };
    } catch (err) {
        console.error('Failed to fetch competition on server:', err);
        
        // Return error state with default SEO metadata from parent
        return {
            competition: null,
            seo: {
                title: parentData.seo.defaultTitle,
                description: parentData.seo.defaultDescription,
                url: parentData.seo.host,
                image: parentData.seo.defaultImage,
                type: 'website',
                siteName: parentData.seo.siteName,
                author: parentData.seo.siteName,
                publishedTime: '',
                modifiedTime: '',
                category: '',
                twitterHandle: parentData.seo.twitterHandle,
                host: parentData.seo.host
            }
        };
    }
};
