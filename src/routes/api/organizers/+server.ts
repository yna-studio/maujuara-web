import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { MongoClient, type MongoClientOptions } from 'mongodb';
import { getMongoUri } from '../../../configs/mongodb';

export const GET: RequestHandler = async ({ url }) => {
	try {
		// Parse query parameters
		const limitParam = url.searchParams.get('limit');
		const orderBy = url.searchParams.get('orderBy');
		
		// Set defaults and validate
		const limit = limitParam ? parseInt(limitParam, 10) : 10;
		const validOrderByFields = ['updated_at', 'created_at'];
		const orderByField = validOrderByFields.includes(orderBy || '') ? orderBy : 'created_at';
		
		// Validate limit
		if (isNaN(limit) || limit < 1 || limit > 100) {
			return json({
				error: 'Invalid limit parameter. Must be a number between 1 and 100.',
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
		const query = {};
		const sort = { [orderByField]: -1 }; // Sort by specified field in descending order
		
		// Execute query
		const organizers = await organizersCollection
			.find(query)
			.sort(sort)
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
				orderBy: orderByField,
				count: organizers.length
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
