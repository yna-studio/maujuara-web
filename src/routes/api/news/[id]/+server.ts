import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { DatabaseService } from '$lib/server/database';
import { ObjectId } from 'mongodb';

// Helper function to remove HTML tags and truncate text
function generateShortDesc(content: string, maxLength: number = 150): string {
	if (!content) return '';
	
	// Remove HTML tags
	const cleanText = content.replace(/<[^>]*>/g, '').trim();
	
	// Truncate to maxLength characters
	if (cleanText.length <= maxLength) return cleanText;
	
	return cleanText.substring(0, maxLength) + '...';
}

export const GET: RequestHandler = async ({ params }) => {
	try {
		const { id } = params;

		// Check if id exists
		if (!id) {
			return json({
				error: 'News ID is required',
				status: 400
			}, { status: 400 });
		}

		// Validate ObjectId format
		if (!ObjectId.isValid(id)) {
			return json({
				error: 'Invalid news ID format',
				status: 400
			}, { status: 400 });
		}

		// Find news by ID with user lookup
		const newsItem = await DatabaseService.aggregate('news', [
			{ $match: { _id: new ObjectId(id) } },
			{
				$lookup: {
					from: 'users',
					localField: 'created_by',
					foreignField: '_id',
					as: 'userInfo'
				}
			},
			{ $unwind: { path: '$userInfo', preserveNullAndEmptyArrays: true } },
			{
				$addFields: {
					createdBy: {
						$cond: {
							if: { $ne: ['$userInfo', null] },
							then: {
								id: { $toString: '$userInfo._id' },
								name: '$userInfo.name',
								avatar: '$userInfo.avatar'
							},
							else: null
						}
					},
					// Ensure tags field exists
					tags: { $ifNull: ['$tags', []] }
				}
			},
			{
				$project: {
					_id: 1,
					title: 1,
					thumbnail: 1,
					content: 1,
					tags: 1,
					created_at: 1,
					updated_at: 1,
					createdBy: 1,
					created_by: 1
				}
			}
		]);

		// Check if news item exists
		if (newsItem.length === 0) {
			return json({
				error: 'News not found',
				status: 404
			}, { status: 404 });
		}

		// Return single news item (not array)
		const item = newsItem[0];
		return json({
			data: {
				...item,
				_id: item._id.toString(),
				// Generate shortDesc in JavaScript
				shortDesc: generateShortDesc(item.content || '', 150)
			},
			status: 200
		});

	} catch (error) {
		console.error('Failed to fetch news detail:', error);
		
		return json({
			error: 'Failed to fetch news detail',
			message: error instanceof Error ? error.message : 'Unknown error',
			status: 500
		}, { status: 500 });
	}
};
