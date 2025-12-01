import type { LayoutServerLoad } from './$types';
import { env } from '$env/dynamic/private';

export const load: LayoutServerLoad = async () => {
    // Default SEO metadata for all pages
    const defaultTitle = 'MauJuara - Ikuti dan menangkan hadiah dari kompetisi online';
    const defaultDescription = 'MauJuara adalah platform kompetisi online yang bisa diikuti seluruh netizen, pilih kategori favoritmu dan menangkan hadiahnya';
    const defaultImage = 'https://maujuara.com/images/Mau%20Juara%20-%20landscape.svg';
    const host = env.PUBLIC_HOST || 'http://localhost:20251';
    
    return {
        seo: {
            defaultTitle,
            defaultDescription,
            defaultImage,
            host,
            siteName: 'Maujuara',
            twitterHandle: '@maujuara'
        }
    };
};
