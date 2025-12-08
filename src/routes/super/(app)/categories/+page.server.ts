import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch }) => {
	try {
		const response = await fetch('/api/categories');
		
		if (!response.ok) {
			console.error('Failed to fetch categories:', response.statusText);
			return {
				categories: [],
				error: 'Failed to load categories'
			};
		}

		const result = await response.json();
		
		return {
			categories: result.data || [],
			meta: result.meta || {}
		};
	} catch (error) {
		console.error('Error loading categories:', error);
		return {
			categories: [],
			error: 'Failed to load categories'
		};
	}
};
