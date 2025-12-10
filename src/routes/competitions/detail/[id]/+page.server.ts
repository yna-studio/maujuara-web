import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent, fetch }) => {
    // Get data from parent layout
    const parentData = await parent();
    
    // Fetch related competitions (exclude current competition, limit to 4)
    let relatedCompetitions = [];
    if (parentData.competition) {
        try {
            const response = await fetch(`/api/competitions?limit=5`);
            if (response.ok) {
                const data = await response.json();
                console.log('Fetched competitions:', data.data?.length || 0);
                console.log('Current competition ID:', parentData.competition._id);
                
                // Filter out current competition and take first 4
                const allCompetitions = data.data || [];
                const filteredCompetitions = allCompetitions.filter((comp: any) => comp._id !== parentData.competition._id);
                console.log('After filtering:', filteredCompetitions.length);
                
                relatedCompetitions = filteredCompetitions.slice(0, 4);
                console.log('Final related competitions:', relatedCompetitions.length);
            }
        } catch (error) {
            console.error('Failed to fetch related competitions:', error);
        }
    }
    
    return {
        competition: parentData.competition,
        relatedCompetitions,
        error: parentData.competition ? null : 'Gagal memuat data kompetisi'
    };
};
