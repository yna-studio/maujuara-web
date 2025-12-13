import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, parent, fetch }) => {
	// Get data from parent layout
	const parentData = await parent();
	
	// Extract ID from slug (format: title-id)
	const slug = params.id;
	const newsId = slug.split('-')[slug.split('-').length - 1];
	
	let news = null;
	let error = null;

	// Validate ObjectId format
	if (!newsId || newsId.length !== 24) {
		error = 'Invalid news ID format';
	} else {
		try {
			// Fetch news detail
			const response = await fetch(`/api/news/${newsId}`);
			const result = await response.json();

			if (!response.ok) {
				error = result.error || 'Failed to fetch news';
			} else {
				news = result.data;
			}
		} catch (err) {
			console.error('Failed to fetch news detail:', err);
			error = 'Failed to fetch news detail';
		}
	}
	
	// Fetch related competitions (limit to 4)
	let relatedCompetitions = [];
	try {
		const response = await fetch('/api/competitions?limit=4');
		if (response.ok) {
			const data = await response.json();
			relatedCompetitions = data.data || [];
			console.log('Fetched related competitions:', relatedCompetitions.length);
		}
	} catch (error) {
		console.error('Failed to fetch related competitions:', error);
	}
	
	return {
		news,
		relatedCompetitions,
		error
	};
};
