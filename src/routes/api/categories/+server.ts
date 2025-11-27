import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { MongoClient, type MongoClientOptions } from 'mongodb';
import { getMongoUri } from '../../../configs/mongodb';

export const GET: RequestHandler = async () => {
	try {
		// Get MongoDB connection
		const uri = getMongoUri();
		
		const client = new MongoClient(uri, {
			serverSelectionTimeoutMS: 10000,
			connectTimeoutMS: 10000
		} as MongoClientOptions);
		
		// Connect to database
		await client.connect();
		const db = client.db();
		const categoriesCollection = db.collection('categories');
		
		// Get all categories
		const categories = await categoriesCollection
			.find({})
			.sort({ name: 1 }) // Sort by name alphabetically
			.toArray();
		
		// Close connection
		await client.close();
		
		return json({
			data: categories.map(category => ({
				id: category._id.toString(),
				name: category.name
			})),
			status: 200,
			meta: {
				count: categories.length
			}
		});
		
	} catch (error) {
		console.error('Failed to fetch categories:', error);
		
		return json({
			error: 'Failed to fetch categories from database',
			message: error instanceof Error ? error.message : 'Unknown error',
			status: 500
		}, { status: 500 });
	}
};
