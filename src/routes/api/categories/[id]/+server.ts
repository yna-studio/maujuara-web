import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { MongoClient, type MongoClientOptions, ObjectId } from 'mongodb';
import { getMongoUri } from '../../../../configs/mongodb';

export const DELETE: RequestHandler = async ({ params }) => {
	try {
		// Get category ID from URL parameters
		const categoryId = params.id;
		
		if (!categoryId) {
			return json({
				error: 'Category ID is required',
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
		
		// Convert string ID to ObjectId
		let objectId;
		
		try {
			objectId = new ObjectId(categoryId);
		} catch {
			await client.close();
			return json({
				error: 'Invalid category ID format',
				status: 400
			}, { status: 400 });
		}
		
		// Check if category exists
		const existingCategory = await categoriesCollection.findOne({ _id: objectId });
		
		if (!existingCategory) {
			await client.close();
			return json({
				error: 'Category not found',
				status: 404
			}, { status: 404 });
		}
		
		// Delete the category
		const result = await categoriesCollection.deleteOne({ _id: objectId });
		
		// Close connection
		await client.close();
		
		if (result.deletedCount === 0) {
			return json({
				error: 'Failed to delete category',
				status: 500
			}, { status: 500 });
		}
		
		return json({
			status: 200,
			message: 'Category deleted successfully'
		});
		
	} catch (error) {
		console.error('Failed to delete category:', error);
		
		return json({
			error: 'Failed to delete category',
			message: error instanceof Error ? error.message : 'Unknown error',
			status: 500
		}, { status: 500 });
	}
};
