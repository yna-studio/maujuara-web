import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ fetch }) => {
	try {
		// Fetch categories
		const categoriesRes = await fetch('/api/categories');
		let categories = [];
		
		if (categoriesRes.ok) {
			const categoriesData = await categoriesRes.json();
			categories = categoriesData?.data || categoriesData || [];
		} else {
			console.error('Failed to fetch categories:', categoriesRes.statusText);
		}

		// Fetch organizers
		const organizersRes = await fetch('/api/organizers');
		let organizers = [];
		
		if (organizersRes.ok) {
			const organizersData = await organizersRes.json();
			organizers = organizersData?.data || organizersData || [];
		} else {
			console.error('Failed to fetch organizers:', organizersRes.statusText);
		}

		return { categories, organizers };
	} catch (err) {
		console.error('Error loading form data:', err);
		throw error(500, 'Failed to load form data');
	}
};
