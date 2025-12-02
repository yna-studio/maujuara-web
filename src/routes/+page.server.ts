import type { PageServerLoad } from './$types';
import { CompetitionsAPI } from '$lib/api/competitions';
import { OrganizersAPI } from '$lib/api/organizers';
import { StatsAPI } from '$lib/api/stats';

export const load: PageServerLoad = async () => {
    try {
        const [competitionsResponse, organizersResponse, statsResponse] = await Promise.all([
            CompetitionsAPI.getCompetitions({ limit: 9 }),
            OrganizersAPI.getOrganizersWithLimit(10, 'updated_at'),
            StatsAPI.getStats()
        ]);

        return {
            competitions: competitionsResponse.data,
            organizers: organizersResponse.data,
            statsRaw: statsResponse.data,
            error: null
        };
    } catch (err) {
        console.error('Failed to load homepage data on server:', err);
        return {
            competitions: [],
            organizers: [],
            statsRaw: null,
            error: 'Failed to load data'
        };
    }
};
