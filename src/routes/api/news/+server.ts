import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { MongoClient, type MongoClientOptions, ObjectId } from 'mongodb';
import { getMongoUri } from '../../../configs/mongodb';

// Helper function to remove HTML tags and truncate text
function generateShortDesc(content: string, maxLength: number = 150): string {
	if (!content) return '';
	
	// Remove HTML tags
	const cleanText = content.replace(/<[^>]*>/g, '').trim();
	
	// Truncate to maxLength characters
	if (cleanText.length <= maxLength) return cleanText;
	
	return cleanText.substring(0, maxLength) + '...';
}

interface NewsData {
	title: string;
	thumbnail: string;
	created_by: string;
	short_desc: string;
	description: string;
	hashtags: string[];
}

interface GetNewsParams {
	search: string;
	limit: number;
	page: number;
}

async function getNews(params: GetNewsParams) {
	const { search, limit, page } = params;

	// Get MongoDB connection
	const uri = getMongoUri();

	const client = new MongoClient(uri, {
		serverSelectionTimeoutMS: 10000,
		connectTimeoutMS: 10000
	} as MongoClientOptions);

	try {
		// Connect to database
		await client.connect();
		const db = client.db();
		const newsCollection = db.collection('news');

		// Build query
		const query: Record<string, any> = {};

		// Add search filter (title search)
		if (search) {
			query.title = { $regex: search, $options: 'i' }; // Case-insensitive search
		}

		// Calculate skip for pagination
		const skip = (page - 1) * limit;

		// Execute query with pagination and user lookup
		const news = await newsCollection
			.aggregate([
				{ $match: query },
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
				},
				{ $sort: { created_at: -1 } },
				{ $skip: skip },
				{ $limit: limit }
			])
			.toArray();

		// Debug: Log the first item to see what fields are available
		if (news.length > 0) {
			console.log('First news item fields:', Object.keys(news[0]));
			console.log('First news item tags:', news[0].tags);
		}

		// Get total count for pagination info
		const totalCount = await newsCollection.countDocuments(query);

		// Calculate pagination info
		const totalPages = Math.ceil(totalCount / limit);

		return {
			news,
			page,
			limit,
			totalPages,
			totalCount
		};
	} finally {
		await client.close();
	}
}

export const GET: RequestHandler = async ({ url }) => {
	try {
		// Parse query parameters
		const search = url.searchParams.get('search') || '';
		const limitParam = url.searchParams.get('limit');
		const pageParam = url.searchParams.get('page');
		
		// Set defaults and validate
		const limit = limitParam ? parseInt(limitParam, 10) : 9;
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

		const { news, page: currentPage, limit: currentLimit, totalPages, totalCount } =
			await getNews({
				search,
				limit,
				page
			});

		return json({
			data: news.map(item => ({
				...item,
				_id: item._id.toString(),
				// Generate shortDesc in JavaScript
				shortDesc: generateShortDesc(item.content || '', 150)
			})),
			status: 200,
			meta: {
				currentPage,
				totalPages,
				totalCount,
				limit: currentLimit,
				hasNextPage: currentPage < totalPages,
				hasPrevPage: currentPage > 1,
				filters: {
					search: search || null
				}
			}
		});
	} catch (error) {
		console.error('Failed to fetch news:', error);
		
		return json({
			error: 'Failed to fetch news from database',
			message: error instanceof Error ? error.message : 'Unknown error',
			status: 500
		}, { status: 500 });
	}
};

export const POST: RequestHandler = async ({ request }) => {
	try {
		// Parse request body
		const body = await request.json();
		const {
			title,
			thumbnail,
			created_by,
			short_desc,
			description,
			hashtags = []
		}: NewsData = body;
		
		// Validate required fields
		const requiredFields = ['title', 'thumbnail', 'created_by', 'short_desc', 'description'];
		const missingFields = requiredFields.filter(field => !body[field] || (typeof body[field] === 'string' && body[field].trim() === ''));
		
		if (missingFields.length > 0) {
			return json({
				error: `Missing required fields: ${missingFields.join(', ')}`,
				status: 400
			}, { status: 400 });
		}
		
		// Validate thumbnail URL
		if (thumbnail && !thumbnail.startsWith('http')) {
			return json({
				error: 'Thumbnail must be a valid URL',
				status: 400
			}, { status: 400 });
		}
		
		// Validate ObjectId format for created_by
		if (!ObjectId.isValid(created_by)) {
			return json({
				error: 'Invalid user ID format for created_by',
				status: 400
			}, { status: 400 });
		}
		
		// Validate hashtags array
		if (!Array.isArray(hashtags)) {
			return json({
				error: 'Hashtags must be an array',
				status: 400
			}, { status: 400 });
		}
		
		// Validate each hashtag is a string
		for (const hashtag of hashtags) {
			if (typeof hashtag !== 'string' || hashtag.trim() === '') {
				return json({
					error: 'Each hashtag must be a non-empty string',
					status: 400
				}, { status: 400 });
			}
		}
		
		// Get MongoDB connection
		const uri = getMongoUri();
		
		const client = new MongoClient(uri, {
			serverSelectionTimeoutMS: 10000,
			connectTimeoutMS: 10000
		} as MongoClientOptions);
		
		// Connect to database
		await client.connect();
		const db = client.db();
		const newsCollection = db.collection('news');
		const usersCollection = db.collection('users');
		
		// Verify user exists
		const userExists = await usersCollection.findOne({ _id: new ObjectId(created_by) });
		if (!userExists) {
			await client.close();
			return json({
				error: 'User not found',
				status: 400
			}, { status: 400 });
		}
		
		// Create new news document
		const currentTime = new Date().toISOString();
		const newNews = {
			title: title.trim(),
			thumbnail: thumbnail.trim(),
			created_by: new ObjectId(created_by),
			short_desc: short_desc.trim(),
			description: description.trim(),
			tags: hashtags.map(tag => tag.trim().replace('#', '')), // Store in tags field
			created_at: currentTime,
			updated_at: currentTime
		};
		
		// Insert into database
		const result = await newsCollection.insertOne(newNews);
		
		// Close connection
		await client.close();
		
		// Return the created news with its ID
		return json({
			data: {
				_id: result.insertedId.toString(),
				...newNews,
				created_by: newNews.created_by.toString(),
				createdBy: {
					id: created_by,
					name: userExists.name,
					avatar: userExists.avatar
				}
			},
			status: 201,
			message: 'News created successfully'
		}, { status: 201 });
		
	} catch (error) {
		console.error('Failed to create news:', error);
		
		return json({
			error: 'Failed to create news',
			message: error instanceof Error ? error.message : 'Unknown error',
			status: 500
		}, { status: 500 });
	}
};
