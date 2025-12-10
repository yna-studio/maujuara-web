import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { MongoClient, type MongoClientOptions, ObjectId } from 'mongodb';
import { getMongoUri } from '../../../../configs/mongodb';
import { uploadOrganizerAvatar } from '../../../../lib/utils/cloudinary';

// GET single organizer by ID
export const GET: RequestHandler = async ({ params }) => {
	try {
		const { id } = params;
		
		if (!id) {
			return json({
				error: 'Organizer ID is required',
				status: 400
			}, { status: 400 });
		}
		
		const uri = getMongoUri();
		
		const client = new MongoClient(uri, {
			serverSelectionTimeoutMS: 10000,
			connectTimeoutMS: 10000
		} as MongoClientOptions);
		
		await client.connect();
		const db = client.db();
		const organizersCollection = db.collection('organizers');
		
		// Try to convert to ObjectId, fallback to string if invalid
		let organizer;
		try {
			const objectId = new ObjectId(id);
			organizer = await organizersCollection.findOne({ _id: objectId });
		} catch {
			// If invalid ObjectId, try string ID using proper query syntax
			organizer = await organizersCollection.findOne({ _id: id as any });
		}
		
		await client.close();
		
		if (!organizer) {
			return json({
				error: 'Organizer not found',
				status: 404
			}, { status: 404 });
		}
		
		return json({
			data: organizer,
			status: 200
		});
		
	} catch (error) {
		console.error('Failed to fetch organizer:', error);
		
		return json({
			error: 'Failed to fetch organizer from database',
			message: error instanceof Error ? error.message : 'Unknown error',
			status: 500
		}, { status: 500 });
	}
};

// PUT (update) organizer by ID
export const PUT: RequestHandler = async ({ params, request }) => {
	try {
		const { id } = params;
		
		if (!id) {
			return json({
				error: 'Organizer ID is required',
				status: 400
			}, { status: 400 });
		}
		
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
		
		// Handle avatar upload if it's base64
		let avatarUrl = avatar;
		if (avatar.startsWith('data:image/')) {
			try {
				const uploadResult = await uploadOrganizerAvatar(avatar, name.trim());
				avatarUrl = uploadResult.secure_url;
			} catch (uploadError) {
				console.error('Avatar upload failed:', uploadError);
				return json({
					error: 'Failed to upload avatar image',
					message: uploadError instanceof Error ? uploadError.message : 'Unknown upload error',
					status: 500
				}, { status: 500 });
			}
		}
		
		const uri = getMongoUri();
		
		const client = new MongoClient(uri, {
			serverSelectionTimeoutMS: 10000,
			connectTimeoutMS: 10000
		} as MongoClientOptions);
		
		await client.connect();
		const db = client.db();
		const organizersCollection = db.collection('organizers');
		
		// Update organizer
		const updateData = {
			name: name.trim(),
			avatar: avatarUrl,
			updated_at: new Date().toISOString()
		};
		
		let result;
		try {
			const objectId = new ObjectId(id);
			result = await organizersCollection.updateOne(
				{ _id: objectId },
				{ $set: updateData }
			);
		} catch {
			// If invalid ObjectId, try string ID using proper query syntax
			result = await organizersCollection.updateOne(
				{ _id: id as any },
				{ $set: updateData }
			);
		}
		
		await client.close();
		
		if (result.matchedCount === 0) {
			return json({
				error: 'Organizer not found',
				status: 404
			}, { status: 404 });
		}
		
		// Fetch updated organizer
		const updatedOrganizer = { ...updateData, _id: id };
		
		return json({
			data: updatedOrganizer,
			status: 200,
			message: 'Organizer updated successfully'
		});
		
	} catch (error) {
		console.error('Failed to update organizer:', error);
		
		return json({
			error: 'Failed to update organizer',
			message: error instanceof Error ? error.message : 'Unknown error',
			status: 500
		}, { status: 500 });
	}
};

// DELETE organizer by ID
export const DELETE: RequestHandler = async ({ params }) => {
	try {
		const { id } = params;
		
		if (!id) {
			return json({
				error: 'Organizer ID is required',
				status: 400
			}, { status: 400 });
		}
		
		const uri = getMongoUri();
		
		const client = new MongoClient(uri, {
			serverSelectionTimeoutMS: 10000,
			connectTimeoutMS: 10000
		} as MongoClientOptions);
		
		await client.connect();
		const db = client.db();
		const organizersCollection = db.collection('organizers');
		
		let result;
		try {
			const objectId = new ObjectId(id);
			result = await organizersCollection.deleteOne({ _id: objectId });
		} catch {
			// If invalid ObjectId, try string ID using proper query syntax
			result = await organizersCollection.deleteOne({ _id: id as any });
		}
		
		await client.close();
		
		if (result.deletedCount === 0) {
			return json({
				error: 'Organizer not found',
				status: 404
			}, { status: 404 });
		}
		
		return json({
			status: 200,
			message: 'Organizer deleted successfully'
		});
		
	} catch (error) {
		console.error('Failed to delete organizer:', error);
		
		return json({
			error: 'Failed to delete organizer',
			message: error instanceof Error ? error.message : 'Unknown error',
			status: 500
		}, { status: 500 });
	}
};
