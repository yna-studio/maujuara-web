import type { LayoutServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: LayoutServerLoad = async ({ parent }) => {
	// Get data from parent layout
	const parentData = await parent();
	
	// If no user data, redirect to login
	if (!parentData.user) {
		throw redirect(302, '/super');
	}
	
	return parentData;
};
