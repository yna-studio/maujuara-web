import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch }) => {
	try {
		// Fetch organizers data
		const organizersRes = await fetch('/api/organizers');
		
		if (!organizersRes.ok) {
			console.error('Failed to fetch organizers:', organizersRes.statusText);
			return { organizers: [] };
		}

		const organizersData = await organizersRes.json();
		const organizers = organizersData?.data || organizersData || [];

		return { organizers };
	} catch (err) {
		console.error('Error loading organizers:', err);
		return { organizers: [] };
	}
};
