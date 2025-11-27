import { apiCaller } from './apiCaller';

interface Organizer {
	id: string;
	name: string;
	avatar: string;
}

interface OrganizersListResponse {
	data: Organizer[];
	status: number;
	meta?: {
		count: number;
	};
}

export class OrganizersListAPI {
	// Get all organizers for list
	static async getAllOrganizers(): Promise<OrganizersListResponse> {
		return apiCaller.get<OrganizersListResponse>('/organizers', {
			limit: 100, // Get all organizers
			orderBy: 'name' // Sort by name
		});
	}
}

export default OrganizersListAPI;
