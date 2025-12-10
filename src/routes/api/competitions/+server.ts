import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { MongoClient, type MongoClientOptions, ObjectId } from 'mongodb';
import { getMongoUri } from '../../../configs/mongodb';
import { TelegramAPI } from '../../../lib/api/telegram';
import { uploadCompetitionPoster } from '../../../lib/utils/cloudinary';

interface Contact {
	type: string;
	value: string;
}

interface CompetitionData {
	title: string;
	poster: string;
	deadline_date: string;
	announcement_date: string;
	organizer: string;
	category: string;
	prize_desc: string;
	prize_estimate?: number;
	desc: string;
	contacts: Contact[];
	link_join: string;
}

interface GetCompetitionsParams {
	search: string;
	id_organizer: string | null;
	id_category: string | null;
	status: string | null;
	limit: number;
	page: number;
}

async function getCompetitions(params: GetCompetitionsParams) {
	const { search, id_organizer, id_category, status, limit, page } = params;

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
		const competitionsCollection = db.collection('competitions');

		// Build query
		const query: Record<string, any> = {};

		// Add search filter (title search)
		if (search) {
			query.title = { $regex: search, $options: 'i' }; // Case-insensitive search
		}

		// Add organizer filter
		if (id_organizer) {
			query.organizer = new ObjectId(id_organizer);
		}

		// Add category filter
		if (id_category) {
			query.category = new ObjectId(id_category);
		}

		// Add status filter based on dates
		// NOTE: deadline_date and announcement_date are stored as ISO8601 *strings* in MongoDB.
		// Use an ISO string for "now" so MongoDB does lexicographical comparison correctly.
		const nowIso = new Date().toISOString();
		if (status) {
			if (status === 'open') {
				// Competitions that are still open for submissions
				// Rule: deadline_date > now
				query.deadline_date = { $gt: nowIso };
			} else if (status === 'progress') {
				// Competitions where submission is closed but announcement not yet made
				// Rule: deadline_date <= now && announcement_date > now
				query.deadline_date = { $lte: nowIso };
				query.announcement_date = { $gt: nowIso };
			} else if (status === 'ended') {
				// Competitions where announcement has been made
				// Rule: announcement_date <= now
				query.announcement_date = { $lte: nowIso };
			}
		}

		// Calculate skip for pagination
		const skip = (page - 1) * limit;

		// Execute query with pagination and organizer lookup
		const competitions = await competitionsCollection
			.aggregate([
				{ $match: query },
				{
					$lookup: {
						from: 'organizers',
						localField: 'organizer',
						foreignField: '_id',
						as: 'organizerInfo'
					}
				},
				{ $unwind: '$organizerInfo' },
				{
					$lookup: {
						from: 'categories',
						localField: 'category',
						foreignField: '_id',
						as: 'categoryInfo'
					}
				},
				{
					$addFields: {
						status: {
							$cond: {
								if: { $lt: [new Date(), { $toDate: '$deadline_date' }] },
								then: 'open',
								else: {
									$cond: {
										if: {
											$and: [
												{ $gte: [new Date(), { $toDate: '$deadline_date' }] },
												{ $lte: [new Date(), { $toDate: '$announcement_date' }] }
											]
										},
										then: 'progress',
										else: 'ended'
									}
								}
							}
						},
						category: {
							$arrayElemAt: ['$categoryInfo', 0]
						}
					}
				},
				{
					$project: {
						_id: 1,
						title: 1,
						poster: 1,
						deadline_date: 1,
						announcement_date: 1,
						created_date: 1,
						updated_date: 1,
						views: 1,
						prize_desc: 1,
						prize_estimate: 1,
						desc: 1,
						contacts: 1,
						link_join: 1,
						status: 1,
						category: {
							id: { $toString: '$category._id' },
							name: '$category.name'
						},
						organizer: {
							id: { $toString: '$organizerInfo._id' },
							name: '$organizerInfo.name',
							avatar: '$organizerInfo.avatar'
						}
					}
				},
				{ $sort: { updated_date: -1 } },
				{ $skip: skip },
				{ $limit: limit }
			])
			.toArray();

		// Get total count for pagination info
		const totalCount = await competitionsCollection.countDocuments(query);

		// Calculate pagination info
		const totalPages = Math.ceil(totalCount / limit);

		return {
			competitions,
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
		const id_organizer = url.searchParams.get('id_organizer');
		const id_category = url.searchParams.get('id_category');
		const status = url.searchParams.get('status');
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
		
		// Validate status if provided
		const validStatuses = ['open', 'progress', 'ended'];
		if (status && !validStatuses.includes(status)) {
			return json({
				error: 'Invalid status parameter. Must be one of: open, progress, ended',
				status: 400
			}, { status: 400 });
		}
		
		// Validate organizer ID if provided
		if (id_organizer && !ObjectId.isValid(id_organizer)) {
			return json({
				error: 'Invalid organizer ID format',
				status: 400
			}, { status: 400 });
		}
		
		// Validate category ID if provided
		if (id_category && !ObjectId.isValid(id_category)) {
			return json({
				error: 'Invalid category ID format',
				status: 400
			}, { status: 400 });
		}

		const { competitions, page: currentPage, limit: currentLimit, totalPages, totalCount } =
			await getCompetitions({
				search,
				id_organizer: id_organizer || null,
				id_category: id_category || null,
				status: status || null,
				limit,
				page
			});

		return json({
			data: competitions.map(comp => ({
				...comp,
				_id: comp._id.toString()
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
					search: search || null,
					id_organizer: id_organizer || null,
					status: status || null
				}
			}
		});
	} catch (error) {
		console.error('Failed to fetch competitions:', error);
		
		return json({
			error: 'Failed to fetch competitions from database',
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
			poster,
			deadline_date,
			announcement_date,
			organizer,
			category,
			prize_desc,
			prize_estimate = 0,
			desc,
			contacts,
			link_join
		}: CompetitionData = body;
		
		// Validate required fields
		const requiredFields = ['title', 'poster', 'deadline_date', 'announcement_date', 'organizer', 'category', 'prize_desc', 'desc', 'contacts', 'link_join'];
		const missingFields = requiredFields.filter(field => !body[field] || (typeof body[field] === 'string' && body[field].trim() === ''));
		
		if (missingFields.length > 0) {
			return json({
				error: `Missing required fields: ${missingFields.join(', ')}`,
				status: 400
			}, { status: 400 });
		}
		
		// Validate poster is base64 if it's a new upload
		if (poster && poster.startsWith('data:image/')) {
			// It's base64, will be uploaded to Cloudinary
		} else if (poster && !poster.startsWith('http')) {
			return json({
				error: 'Poster must be a valid base64 image string or URL',
				status: 400
			}, { status: 400 });
		}
		
		// Validate ObjectId format for organizer
		if (!ObjectId.isValid(organizer)) {
			return json({
				error: 'Invalid organizer ID format',
				status: 400
			}, { status: 400 });
		}
		
		// Validate ObjectId format for category
		if (!ObjectId.isValid(category)) {
			return json({
				error: 'Invalid category ID format',
				status: 400
			}, { status: 400 });
		}
		
		// Validate date formats (ISO-8601)
		const dateFields = ['deadline_date', 'announcement_date'];
		for (const field of dateFields) {
			const date = new Date(body[field]);
			if (isNaN(date.getTime())) {
				return json({
					error: `Invalid ${field} format. Must be ISO-8601 format`,
					status: 400
				}, { status: 400 });
			}
		}
		
		// Validate contacts array
		if (!Array.isArray(contacts) || contacts.length === 0) {
			return json({
				error: 'Contacts must be a non-empty array',
				status: 400
			}, { status: 400 });
		}
		
		for (const contact of contacts) {
			if (!contact.type || !contact.value || typeof contact.type !== 'string' || typeof contact.value !== 'string') {
				return json({
					error: 'Each contact must have type and value as strings',
					status: 400
				}, { status: 400 });
			}
		}
		
		// Validate prize_estimate
		const prizeNum = Number(prize_estimate);
		if (isNaN(prizeNum) || prizeNum < 0) {
			return json({
				error: 'prize_estimate must be a non-negative number',
				status: 400
			}, { status: 400 });
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
		const competitionsCollection = db.collection('competitions');
		const organizersCollection = db.collection('organizers');
		
		// Verify organizer exists
		const organizerExists = await organizersCollection.findOne({ _id: new ObjectId(organizer) });
		if (!organizerExists) {
			await client.close();
			return json({
				error: 'Organizer not found',
				status: 400
			}, { status: 400 });
		}
		
		// Handle poster upload if it's base64
		let posterUrl = poster;
		if (poster.startsWith('data:image/')) {
			try {
				const uploadResult = await uploadCompetitionPoster(poster, title, deadline_date);
				posterUrl = uploadResult.secure_url;
			} catch (uploadError) {
				console.error('Poster upload failed:', uploadError);
				return json({
					error: 'Failed to upload poster image',
					message: uploadError instanceof Error ? uploadError.message : 'Unknown upload error',
					status: 500
				}, { status: 500 });
			}
		}
		
		// Create new competition document
		const currentTime = new Date().toISOString();
		const newCompetition = {
			title: title.trim(),
			poster: posterUrl.trim(),
			deadline_date: new Date(deadline_date).toISOString(),
			announcement_date: new Date(announcement_date).toISOString(),
			organizer: new ObjectId(organizer),
			category: new ObjectId(category),
			created_date: currentTime,
			updated_date: currentTime,
			views: 1,
			prize_desc: prize_desc.trim(),
			prize_estimate: prizeNum,
			desc: desc.trim(),
			contacts: contacts.map(contact => ({
				type: contact.type.trim(),
				value: contact.value.trim()
			})),
			link_join: link_join.trim()
		};
		
		// Insert into database
		const result = await competitionsCollection.insertOne(newCompetition);
		
		// Update organizer's updated_at field
		await organizersCollection.updateOne(
			{ _id: new ObjectId(organizer) },
			{ $set: { updated_at: currentTime } }
		);
		
		// Close connection
		await client.close();
		
		// Send Telegram notification after successful creation
		try {
			await TelegramAPI.sendNewCompetitionNotification(result.insertedId.toString(), title);
			console.log('Telegram notification sent successfully for new competition');
		} catch (telegramError) {
			console.error('Failed to send Telegram notification:', telegramError);
			// Don't fail the request if Telegram notification fails
		}
		
		// Return the created competition with its ID
		return json({
			data: {
				_id: result.insertedId.toString(),
				...newCompetition,
				organizer: newCompetition.organizer.toString()
			},
			status: 201,
			message: 'Competition created successfully'
		}, { status: 201 });
		
	} catch (error) {
		console.error('Failed to create competition:', error);
		
		return json({
			error: 'Failed to create competition',
			message: error instanceof Error ? error.message : 'Unknown error',
			status: 500
		}, { status: 500 });
	}
};
