import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { DatabaseService } from '$lib/server/database';
import { uploadOrganizerAvatar } from '../../../lib/utils/cloudinary';

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
		const totalCount = await DatabaseService.count('organizers', query);
		
		const organizers = await DatabaseService.find('organizers', query, {
			sort,
			skip,
			limit
		});
		
		// Debug: log the results
		console.log('Organizers query results:', organizers.length, 'documents');
		if (organizers.length > 0) {
			console.log('Sample document:', JSON.stringify(organizers[0], null, 2));
		}
		
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
		
		// Validate that avatar is base64
		if (!avatar.startsWith('data:image/')) {
			return json({
				error: 'Avatar must be a valid base64 image string',
				status: 400
			}, { status: 400 });
		}
		
		// Upload avatar to Cloudinary
		let avatarUrl: string;
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
		
		// Create new organizer document
		const currentTime = new Date().toISOString();
		const newOrganizer = {
			name: name.trim(),
			avatar: avatarUrl, // Store Cloudinary URL instead of base64
			created_at: currentTime,
			updated_at: currentTime
		};
		
		// Insert into database
		const result = await DatabaseService.insertOne('organizers', newOrganizer);
		
		// Return created organizer with its ID
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
