import { apiCaller } from './apiCaller';
import type { Competition, CompetitionsResponse } from '../../routes/api/competitions/$types';
export type { Competition, CompetitionsResponse };

export class CompetitionsAPI {
    // Get all competitions with flexible query params (limit, page, filters, etc.)
    static async getCompetitions(params?: Record<string, any>, customFetch?: typeof fetch): Promise<CompetitionsResponse> {
        return apiCaller.get<CompetitionsResponse>('/competitions', params, customFetch);
    }

    // Get competition by ID
    static async getCompetitionById(id: string, customFetch?: typeof fetch): Promise<Competition> {
        const response = await apiCaller.get<{ data: Competition; status: number }>(`/competitions/${id}`, undefined, customFetch);
        return response.data;
    }

    // Search competitions by category
    static async getCompetitionsByCategory(category: string, limit?: number, customFetch?: typeof fetch): Promise<CompetitionsResponse> {
        const params: Record<string, any> = { category };
        if (limit) {
            params.limit = limit;
        }

        return apiCaller.get<CompetitionsResponse>('/competitions', params, customFetch);
    }

    // Search competitions by status
    static async getCompetitionsByStatus(status: string, limit?: number, customFetch?: typeof fetch): Promise<CompetitionsResponse> {
        const params: Record<string, any> = { status };
        if (limit) {
            params.limit = limit;
        }

        return apiCaller.get<CompetitionsResponse>('/competitions', params, customFetch);
    }
}

export default CompetitionsAPI;
