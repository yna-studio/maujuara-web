import { apiCaller } from './apiCaller';
import type { Organizer, OrganizersResponse } from '../../routes/api/organizers/$types';
export type { Organizer, OrganizersResponse };

export class OrganizersAPI {
    // Get all organizers
    static async getOrganizers(customFetch?: typeof fetch): Promise<OrganizersResponse> {
        return apiCaller.get<OrganizersResponse>('/organizers', undefined, customFetch);
    }

    // Get organizer by ID
    static async getOrganizerById(id: string, customFetch?: typeof fetch): Promise<Organizer> {
        const response = await apiCaller.get<{ data: Organizer; status: number }>(`/organizers/${id}`, undefined, customFetch);
        return response.data;
    }

    // Get organizers with limit and orderBy
    static async getOrganizersWithLimit(limit: number, orderBy?: string, customFetch?: typeof fetch): Promise<OrganizersResponse> {
        const params: Record<string, any> = { limit };
        if (orderBy) {
            params.orderBy = orderBy;
        }
        return apiCaller.get<OrganizersResponse>('/organizers', params, customFetch);
    }

    // Get organizers with pagination
    static async getOrganizersWithPagination(limit: number, page: number, orderBy?: string, search?: string, customFetch?: typeof fetch): Promise<OrganizersResponse> {
        const params: Record<string, any> = { limit, page };
        if (orderBy) {
            params.orderBy = orderBy;
        }
        if (search) {
            params.search = search;
        }
        return apiCaller.get<OrganizersResponse>('/organizers', params, customFetch);
    }
}

export default OrganizersAPI;
