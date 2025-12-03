import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent }) => {
	// Get data from parent layout
	const parentData = await parent();
	return parentData;
};
