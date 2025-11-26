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

    // Get organizers with limit
    static async getOrganizersWithLimit(limit: number): Promise<OrganizersResponse> {
        return apiCaller.get<OrganizersResponse>('/organizers', { limit });
    }
}

export default OrganizersAPI;
