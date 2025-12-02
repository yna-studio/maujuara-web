import { apiCaller } from './apiCaller';
import type { Competition, CompetitionsResponse } from '../../routes/api/competitions/$types';

export class CompetitionsAPI {
    // Get all competitions with flexible query params (limit, page, filters, etc.)
    static async getCompetitions(params?: Record<string, any>): Promise<CompetitionsResponse> {
        return apiCaller.get<CompetitionsResponse>('/competitions', params);
    }

    // Get competition by ID
    static async getCompetitionById(id: string): Promise<Competition> {
        const response = await apiCaller.get<{ data: Competition; status: number }>(`/competitions/${id}`);
        return response.data;
    }

    // Search competitions by category
    static async getCompetitionsByCategory(category: string, limit?: number): Promise<CompetitionsResponse> {
        const params: Record<string, any> = { category };
        if (limit) {
            params.limit = limit;
        }
        
        return apiCaller.get<CompetitionsResponse>('/competitions', params);
    }

    // Search competitions by status
    static async getCompetitionsByStatus(status: string, limit?: number): Promise<CompetitionsResponse> {
        const params: Record<string, any> = { status };
        if (limit) {
            params.limit = limit;
        }
        
        return apiCaller.get<CompetitionsResponse>('/competitions', params);
    }
}

export default CompetitionsAPI;
