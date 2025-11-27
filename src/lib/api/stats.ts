import { apiCaller } from './apiCaller';

interface StatsData {
    active_competition: number;
    total_competition: number;
    total_organizers: number;
    prize_this_year: number;
    competitions_this_year: number;
}

interface StatsResponse {
    data: StatsData;
    status: number;
    meta: {
        generated_at: string;
        year: number;
    };
}

export class StatsAPI {
    // Get all statistics
    static async getStats(): Promise<StatsResponse> {
        return apiCaller.get<StatsResponse>('/stats');
    }
}

export default StatsAPI;
