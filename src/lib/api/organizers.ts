import { apiCaller } from './apiCaller';
import type { Organizer, OrganizersResponse } from '../../routes/api/organizers/$types';

export class OrganizersAPI {
    // Get all organizers
    static async getOrganizers(): Promise<OrganizersResponse> {
        return apiCaller.get<OrganizersResponse>('/organizers');
    }

    // Get organizer by ID
    static async getOrganizerById(id: string): Promise<Organizer> {
        const response = await apiCaller.get<{ data: Organizer; status: number }>(`/organizers/${id}`);
        return response.data;
    }

    // Get organizers with limit and orderBy
    static async getOrganizersWithLimit(limit: number, orderBy?: string): Promise<OrganizersResponse> {
        const params: Record<string, any> = { limit };
        if (orderBy) {
            params.orderBy = orderBy;
        }
        return apiCaller.get<OrganizersResponse>('/organizers', params);
    }
}

export default OrganizersAPI;
