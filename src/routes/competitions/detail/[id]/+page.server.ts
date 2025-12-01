import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent }) => {
    // Get data from parent layout
    const parentData = await parent();
    
    return {
        competition: parentData.competition,
        error: parentData.competition ? null : 'Gagal memuat data kompetisi'
    };
};
