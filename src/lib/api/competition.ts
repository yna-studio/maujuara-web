import { apiCaller } from './apiCaller';

interface Competition {
	_id: string;
	title: string;
	poster: string;
	deadline_date: string;
	announcement_date: string;
	created_date: string;
	updated_date: string;
	views: number;
	prize_desc: string;
	prize_estimate?: number;
	desc: string;
	contacts: Array<{
		type: string;
		value: string;
	}>;
	link_join: string;
	status: 'open' | 'progress' | 'closed';
	category: {
		id: string;
		name: string;
	};
	organizer: {
		id: string;
		name: string;
		avatar: string;
	};
}

interface CompetitionResponse {
	data: Competition;
	status: number;
}

export class CompetitionAPI {
	// Get competition by ID
	static async getCompetitionById(id: string): Promise<CompetitionResponse> {
		return apiCaller.get<CompetitionResponse>(`/competitions/${id}`);
	}
}

export default CompetitionAPI;
