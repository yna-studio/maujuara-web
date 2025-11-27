import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { MongoClient, type MongoClientOptions, ObjectId } from 'mongodb';
import { getMongoUri } from '../../../configs/mongodb';

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
	prize_desc: string;
	prize_estimate?: number;
	desc: string;
	contacts: Contact[];
	link_join: string;
}

export const GET: RequestHandler = async ({ url }) => {
	try {
		// Parse query parameters
		const search = url.searchParams.get('search') || '';
		const id_organizer = url.searchParams.get('id_organizer');
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
		const validStatuses = ['progress', 'ended', 'closed'];
		if (status && !validStatuses.includes(status)) {
			return json({
				error: 'Invalid status parameter. Must be one of: progress, ended, closed',
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
		
		// Add status filter based on dates
		const now = new Date();
		if (status) {
			if (status === 'progress') {
				query.deadline_date = { $gt: now.toISOString() };
			} else if (status === 'ended') {
				query.deadline_date = { $lte: now.toISOString() };
				query.announcement_date = { $gt: now.toISOString() };
			} else if (status === 'closed') {
				query.announcement_date = { $lte: now.toISOString() };
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
								if: { $lt: [new Date(), '$deadline_date'] },
								then: 'open',
								else: {
									$cond: {
										if: { $and: [
											{ $gte: [new Date(), '$deadline_date'] },
											{ $lt: [new Date(), '$announcement_date'] }
										]},
										then: 'ended',
										else: 'closed'
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
				{ $sort: { created_date: -1 } },
				{ $skip: skip },
				{ $limit: limit }
			])
			.toArray();
		
		// Get total count for pagination info
		const totalCount = await competitionsCollection.countDocuments(query);
		
		// Close connection
		await client.close();
		
		// Calculate pagination info
		const totalPages = Math.ceil(totalCount / limit);
		
		return json({
			data: competitions.map(comp => ({
				...comp,
				_id: comp._id.toString()
			})),
			status: 200,
			meta: {
				currentPage: page,
				totalPages,
				totalCount,
				limit,
				hasNextPage: page < totalPages,
				hasPrevPage: page > 1,
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
			prize_desc,
			prize_estimate = 0,
			desc,
			contacts,
			link_join
		}: CompetitionData = body;
		
		// Validate required fields
		const requiredFields = ['title', 'poster', 'deadline_date', 'announcement_date', 'organizer', 'prize_desc', 'desc', 'contacts', 'link_join'];
		const missingFields = requiredFields.filter(field => !body[field] || (typeof body[field] === 'string' && body[field].trim() === ''));
		
		if (missingFields.length > 0) {
			return json({
				error: `Missing required fields: ${missingFields.join(', ')}`,
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
		
		// Create new competition document
		const currentTime = new Date().toISOString();
		const newCompetition = {
			title: title.trim(),
			poster: poster.trim(),
			deadline_date: new Date(deadline_date).toISOString(),
			announcement_date: new Date(announcement_date).toISOString(),
			organizer: new ObjectId(organizer),
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
