import { apiCaller } from './apiCaller';
import type { News, NewsResponse } from '../../routes/api/news/$types';

export class NewsAPI {
    // Get all news with pagination and search
    static async getNews(params?: Record<string, any>): Promise<NewsResponse> {
        return apiCaller.get<NewsResponse>('/news', params);
    }

    // Get news by ID
    static async getNewsById(id: string): Promise<News> {
        const response = await apiCaller.get<{ data: News; status: number }>(`/news/${id}`);
        return response.data;
    }

    // Search news by query
    static async searchNews(query: string, limit?: number): Promise<NewsResponse> {
        const params: Record<string, any> = { search: query };
        if (limit) {
            params.limit = limit;
        }
        
        return apiCaller.get<NewsResponse>('/news', params);
    }

    // Get news with pagination
    static async getNewsWithPagination(page: number, limit: number = 9): Promise<NewsResponse> {
        return apiCaller.get<NewsResponse>('/news', { page, limit });
    }
}

export default NewsAPI;
