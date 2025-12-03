import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, fetch }) => {
	try {
		// Fetch organizer data
		const organizerRes = await fetch(`/api/organizers/${params.id}`);

		if (!organizerRes.ok) {
			if (organizerRes.status === 404) {
				throw error(404, 'Organizer not found');
			}
			console.error('Failed to fetch organizer:', organizerRes.statusText);
			throw error(500, 'Failed to load organizer');
		}

		const organizerData = await organizerRes.json();
		const organizer = organizerData?.data || organizerData;

		return { organizer };
	} catch (err) {
		console.error('Error loading organizer:', err);
		throw error(500, 'Failed to load organizer');
	}
};
