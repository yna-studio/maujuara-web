import type { PageServerLoad, Actions } from './$types';
import { error, fail, redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, fetch }) => {
	try {
		// Fetch competition data
		const competitionRes = await fetch(`/api/competitions/${params.id}`);

		if (!competitionRes.ok) {
			if (competitionRes.status === 404) {
				throw error(404, 'Competition not found');
			}
			console.error('Failed to fetch competition:', competitionRes.statusText);
			throw error(500, 'Failed to load competition');
		}

		const competition = await competitionRes.json();
		const comp = competition?.data || competition;

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

		return { competition: comp, categories, organizers };
	} catch (err) {
		console.error('Error loading competition:', err);
		throw error(500, 'Failed to load competition');
	}
};

export const actions: Actions = {
	save: async ({ request, params, fetch }) => {
		const formData = await request.formData();
		const id = params.id;

		const payload = {
			title: formData.get('title')?.toString().trim(),
			category: formData.get('category')?.toString().trim(),
			deadline_date: formData.get('deadline_date')?.toString().trim(),
			announcement_date: formData.get('announcement_date')?.toString().trim(),
			organizer: formData.get('organizer')?.toString().trim(),
			prize_estimate: formData.get('prize_estimation')?.toString().trim(),
			prize_desc: formData.get('prize_description')?.toString().trim(),
			link_join: formData.get('join_link')?.toString().trim(),
			desc: formData.get('description')?.toString().trim(),
			poster: formData.get('poster_url')?.toString().trim(),
			contact: formData.get('contact')?.toString().trim()
		};

		try {
			const res = await fetch(`/api/competitions/${id}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload)
			});

			if (!res.ok) {
				const err = await res.text();
				console.error('Failed to update competition:', res.statusText, err);
				return fail(500, { error: 'Failed to update competition.' });
			}

			// Optionally redirect on success
			// throw redirect(303, '/super/competitions');
			return { success: 'Competition updated successfully.' };
		} catch (err) {
			console.error('Error updating competition:', err);
			return fail(500, { error: 'Failed to update competition.' });
		}
	}
};
