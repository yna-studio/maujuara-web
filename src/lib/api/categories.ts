import { apiCaller } from './apiCaller';

interface Category {
	id: string;
	name: string;
}

interface CategoriesResponse {
	data: Category[];
	status: number;
	meta?: {
		count: number;
	};
}

export class CategoriesAPI {
	// Get all categories
	static async getCategories(): Promise<CategoriesResponse> {
		return apiCaller.get<CategoriesResponse>('/categories');
	}
}

export default CategoriesAPI;
