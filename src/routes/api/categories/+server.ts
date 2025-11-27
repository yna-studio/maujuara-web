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

export const POST: RequestHandler = async ({ request }) => {
	try {
		// Parse request body
		const body = await request.json();
		const { name } = body;
		
		// Validate required field
		if (!name || typeof name !== 'string' || name.trim() === '') {
			return json({
				error: 'Category name is required',
				status: 400
			}, { status: 400 });
		}
		
		// Validate name length
		if (name.trim().length < 2 || name.trim().length > 50) {
			return json({
				error: 'Category name must be between 2 and 50 characters',
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
		const categoriesCollection = db.collection('categories');
		
		// Check if category already exists
		const existingCategory = await categoriesCollection.findOne({ 
			name: { $regex: new RegExp(`^${name.trim()}$`, 'i') }
		});
		
		if (existingCategory) {
			await client.close();
			return json({
				error: 'Category with this name already exists',
				status: 409
			}, { status: 409 });
		}
		
		// Create new category
		const newCategory = {
			name: name.trim(),
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString()
		};
		
		// Insert into database
		const result = await categoriesCollection.insertOne(newCategory);
		
		// Close connection
		await client.close();
		
		// Return the created category
		return json({
			data: {
				id: result.insertedId.toString(),
				name: newCategory.name,
				created_at: newCategory.created_at,
				updated_at: newCategory.updated_at
			},
			status: 201,
			message: 'Category created successfully'
		}, { status: 201 });
		
	} catch (error) {
		console.error('Failed to create category:', error);
		
		return json({
			error: 'Failed to create category',
			message: error instanceof Error ? error.message : 'Unknown error',
			status: 500
		}, { status: 500 });
	}
};
