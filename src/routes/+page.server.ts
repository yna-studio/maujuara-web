import type { PageServerLoad } from './$types';
import { CompetitionsAPI } from '$lib/api/competitions';
import { OrganizersAPI } from '$lib/api/organizers';
import { StatsAPI } from '$lib/api/stats';
import { TagsAPI } from '$lib/api/tags';

export const load: PageServerLoad = async ({ fetch }) => {
    try {
        const [competitionsResponse, organizersResponse, statsResponse, tagsResponse] = await Promise.all([
            CompetitionsAPI.getCompetitions({ limit: 9 }, fetch),
            OrganizersAPI.getOrganizersWithLimit(10, 'updated_at', fetch),
            StatsAPI.getStats(fetch),
            TagsAPI.getTags({ limit: 12 }, fetch) // Get top 12 tags
        ]);

        return {
            competitions: competitionsResponse.data,
            organizers: organizersResponse.data,
            statsRaw: statsResponse.data,
            tags: tagsResponse.data,
            error: null
        };
    } catch (err) {
        console.error('Failed to load homepage data on server:', err);
        return {
            competitions: [],
            organizers: [],
            statsRaw: null,
            tags: [],
            error: 'Failed to load data'
        };
    }
};
