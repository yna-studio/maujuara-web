import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { DatabaseService } from '$lib/server/database';

interface GetTagsParams {
	limit: number;
	page: number;
}

async function getTags(params: GetTagsParams) {
	const { limit, page } = params;

	try {
		// Calculate skip for pagination
		const skip = (page - 1) * limit;

		// Execute query with pagination and sorting by total (descending)
		const tags = await DatabaseService.find('tags', { total: { $gt: 0 } }, {
			sort: { total: -1 }, // Order by total biggest first
			skip,
			limit
		});

		// Get total count for pagination info
		const totalCount = await DatabaseService.count('tags', { total: { $gt: 0 } });

		// Calculate pagination info
		const totalPages = Math.ceil(totalCount / limit);

		return {
			tags,
			page,
			limit,
			totalPages,
			totalCount
		};
	} catch (error) {
		console.error('Failed to fetch tags:', error);
		throw error;
	}
}

export const GET: RequestHandler = async ({ url }) => {
	try {
		// Parse query parameters
		const limitParam = url.searchParams.get('limit');
		const pageParam = url.searchParams.get('page');
		
		// Set defaults and validate
		const limit = limitParam ? parseInt(limitParam, 10) : 20;
		const page = pageParam ? parseInt(pageParam, 10) : 1;
		
		// Validate limit and page
		if (isNaN(limit) || limit < 1 || limit > 100) {
			return json({
				error: 'Invalid limit parameter. Must be a number between 1 and 100.',
				status: 400
			}, { status: 400 });
		}
		
		if (isNaN(page) || page < 1) {
			return json({
				error: 'Invalid page parameter. Must be a number greater than 0.',
				status: 400
			}, { status: 400 });
		}

		const { tags, page: currentPage, limit: currentLimit, totalPages, totalCount } =
			await getTags({
				limit,
				page
			});

		return json({
			data: tags.map(tag => ({
				...tag,
				_id: tag._id.toString()
			})),
			status: 200,
			meta: {
				currentPage,
				totalPages,
				totalCount,
				limit: currentLimit,
				hasNextPage: currentPage < totalPages,
				hasPrevPage: currentPage > 1
			}
		});
	} catch (error) {
		console.error('Failed to fetch tags:', error);
		
		return json({
			error: 'Failed to fetch tags from database',
			message: error instanceof Error ? error.message : 'Unknown error',
			status: 500
		}, { status: 500 });
	}
};
