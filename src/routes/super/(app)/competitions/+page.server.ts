import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch }) => {
	try {
		const res = await fetch('/api/competitions');

		if (!res.ok) {
			console.error('Failed to fetch competitions:', res.statusText);
			return { competitions: [] };
		}

		const json = await res.json();

		// Adjust based on your API response shape; assuming { data: [...] } wrapper
		const competitions = json?.data || json || [];

		return { competitions };
	} catch (err) {
		console.error('Error loading competitions:', err);
		return { competitions: [] };
	}
};
