import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { MongoClient, type MongoClientOptions } from 'mongodb';
import { getMongoUri } from '../../../configs/mongodb';

export const GET: RequestHandler = async ({ url }) => {
	try {
		// Parse query parameters
		const limitParam = url.searchParams.get('limit');
		const pageParam = url.searchParams.get('page');
		const orderBy = url.searchParams.get('orderBy');
		const search = url.searchParams.get('search');
		
		// Set defaults and validate
		const limit = limitParam ? parseInt(limitParam, 10) : 15;
		const page = pageParam ? parseInt(pageParam, 10) : 1;
		const validOrderByFields = ['updated_at', 'created_at'];
		const orderByField = validOrderByFields.includes(orderBy || '') ? orderBy : 'created_at';
		
		// Validate limit
		if (isNaN(limit) || limit < 1 || limit > 100) {
			return json({
				error: 'Invalid limit parameter. Must be a number between 1 and 100.',
				status: 400
			}, { status: 400 });
		}
		
		// Validate page
		if (isNaN(page) || page < 1) {
			return json({
				error: 'Invalid page parameter. Must be a number greater than 0.',
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
		const organizersCollection = db.collection('organizers');
		
		// Build query
		const query: Record<string, any> = {};
		
		// Add search filter for organizer name
		if (search && search.trim() !== '') {
			query.name = { $regex: search.trim(), $options: 'i' }; // Case-insensitive search
		}
		
		const sort: Record<string, 1 | -1> = {};
sort[orderByField!] = -1; // Sort by specified field in descending order
		
		// Execute query with pagination
		const skip = (page - 1) * limit;
		
		// Get total count for pagination metadata
		const totalCount = await organizersCollection.countDocuments(query);
		
		const organizers = await organizersCollection
			.find(query)
			.sort(sort)
			.skip(skip)
			.limit(limit)
			.toArray();
		
		// Debug: log the results and collection info
		console.log('Organizers query results:', organizers.length, 'documents');
		console.log('Collection name:', organizersCollection.collectionName);
		console.log('Database name:', db.databaseName);
		if (organizers.length > 0) {
			console.log('Sample document:', JSON.stringify(organizers[0], null, 2));
		}
		
		// Close connection
		await client.close();
		
		return json({
			data: organizers,
			status: 200,
			meta: {
				limit,
				page,
				orderBy: orderByField,
				search: search || null,
				count: organizers.length,
				totalCount,
				totalPages: Math.ceil(totalCount / limit),
				hasNextPage: page < Math.ceil(totalCount / limit)
			}
		});
		
	} catch (error) {
		console.error('Failed to fetch organizers:', error);
		
		return json({
			error: 'Failed to fetch organizers from database',
			message: error instanceof Error ? error.message : 'Unknown error',
			status: 500
		}, { status: 500 });
	}
};

export const POST: RequestHandler = async ({ request }) => {
	try {
		// Parse request body
		const body = await request.json();
		const { name, avatar } = body;
		
		// Validate required fields
		if (!name || typeof name !== 'string' || name.trim() === '') {
			return json({
				error: 'Name is required and must be a non-empty string',
				status: 400
			}, { status: 400 });
		}
		
		if (!avatar || typeof avatar !== 'string' || avatar.trim() === '') {
			return json({
				error: 'Avatar is required and must be a non-empty string',
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
		const organizersCollection = db.collection('organizers');
		
		// Create new organizer document
		const currentTime = new Date().toISOString();
		const newOrganizer = {
			name: name.trim(),
			avatar: avatar.trim(),
			created_at: currentTime,
			updated_at: currentTime
		};
		
		// Insert into database
		const result = await organizersCollection.insertOne(newOrganizer);
		
		// Close connection
		await client.close();
		
		// Return the created organizer with its ID
		return json({
			data: {
				_id: result.insertedId.toString(),
				...newOrganizer
			},
			status: 201,
			message: 'Organizer created successfully'
		}, { status: 201 });
		
	} catch (error) {
		console.error('Failed to create organizer:', error);
		
		return json({
			error: 'Failed to create organizer',
			message: error instanceof Error ? error.message : 'Unknown error',
			status: 500
		}, { status: 500 });
	}
};
