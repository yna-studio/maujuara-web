import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { MongoClient, ObjectId, type MongoClientOptions } from 'mongodb';
import { getMongoUri } from '../../../../configs/mongodb';
import { TelegramAPI } from '../../../../lib/api/telegram';
import { uploadCompetitionPoster } from '../../../../lib/utils/cloudinary';

export const GET: RequestHandler = async ({ params }) => {
	try {
		const { id } = params;

		// Validate ID exists
		if (!id) {
			return json({
				error: 'Competition ID is required',
				status: 400
			}, { status: 400 });
		}

		// Validate ObjectId format
		if (!ObjectId.isValid(id)) {
			return json({
				error: 'Invalid competition ID format',
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

		// Find competition by ID with aggregation
		const competition = await competitionsCollection
			.aggregate([
				{ $match: { _id: new ObjectId(id) } },
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
						link_source: 1,
						tags: 1,
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
				}
			])
			.next();

		// Check if competition exists
		if (!competition) {
			await client.close();
			return json({
				error: 'Competition not found',
				status: 404
			}, { status: 404 });
		}

		// Increment view count
		await competitionsCollection.updateOne(
			{ _id: new ObjectId(id) },
			{ $inc: { views: 1 } }
		);

		// Close connection
		await client.close();

		// Convert _id to string
		const response = {
			...competition,
			_id: competition._id.toString()
		};

		return json({
			data: response,
			status: 200
		});

	} catch (error) {
		console.error('Failed to fetch competition:', error);

		return json({
			error: 'Failed to fetch competition from database',
			message: error instanceof Error ? error.message : 'Unknown error',
			status: 500
		}, { status: 500 });
	}
};

export const PUT: RequestHandler = async ({ params, request }) => {
	try {
		const { id } = params;
		const body = await request.json();

		// Validate ID exists
		if (!id) {
			return json({
				error: 'Competition ID is required',
				status: 400
			}, { status: 400 });
		}

		// Validate ObjectId format
		if (!ObjectId.isValid(id)) {
			return json({
				error: 'Invalid competition ID format',
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

		// Check if competition exists
		const existingCompetition = await competitionsCollection.findOne({ _id: new ObjectId(id) });
		if (!existingCompetition) {
			await client.close();
			return json({
				error: 'Competition not found',
				status: 404
			}, { status: 404 });
		}

		// Prepare update data
		const now = new Date();
		let updateData = {
			...body,
			updated_date: now.toISOString(),
			// Convert string IDs to ObjectId if needed
			category: body.category ? new ObjectId(body.category) : existingCompetition.category,
			organizer: body.organizer ? new ObjectId(body.organizer) : existingCompetition.organizer,
			// Handle tags array
			tags: body.tags ? (Array.isArray(body.tags) ? body.tags.map((tag: string) => tag.trim()).filter((tag: string) => tag.length > 0) : []) : existingCompetition.tags,
			// Handle link_source (required) & link_join (optional)
			link_source: body.link_source !== undefined ? body.link_source.trim() : existingCompetition.link_source,
			link_join: body.link_join !== undefined ? (body.link_join ? body.link_join.trim() : '') : existingCompetition.link_join
		};

		// Handle poster upload if it's base64
		if (body.poster && body.poster.startsWith('data:image/')) {
			try {
				const uploadResult = await uploadCompetitionPoster(
					body.poster,
					body.title || existingCompetition.title,
					body.deadline_date || existingCompetition.deadline_date
				);
				updateData.poster = uploadResult.secure_url;
			} catch (uploadError) {
				console.error('Poster upload failed:', uploadError);
				await client.close();
				return json({
					error: 'Failed to upload poster image',
					message: uploadError instanceof Error ? uploadError.message : 'Unknown upload error',
					status: 500
				}, { status: 500 });
			}
		} else if (body.poster && !body.poster.startsWith('http')) {
			await client.close();
			return json({
				error: 'Poster must be a valid base64 image string or URL',
				status: 400
			}, { status: 400 });
		}

		// Update competition
		const result = await competitionsCollection.updateOne(
			{ _id: new ObjectId(id) },
			{ $set: updateData }
		);

		// Handle tags collection updates
		const oldTags = existingCompetition.tags || [];
		const newTags = updateData.tags || [];
		const tagsCollection = db.collection('tags');

		// Tags to remove (in old but not in new)
		const tagsToRemove = oldTags.filter((tag: string) => !newTags.includes(tag));
		// Tags to add (in new but not in old)
		const tagsToAdd = newTags.filter((tag: string) => !oldTags.includes(tag));

		// Decrease total for removed tags
		for (const tagName of tagsToRemove) {
			const trimmedTag = tagName.trim().toLowerCase();
			await tagsCollection.updateOne(
				{ name: trimmedTag },
				{ $inc: { total: -1 }, $set: { updated_at: now.toISOString() } }
			);
		}

		// Increase total for added tags
		for (const tagName of tagsToAdd) {
			if (tagName.trim()) {
				const trimmedTag = tagName.trim().toLowerCase();

				// Try to update existing tag first
				const updateResult = await tagsCollection.updateOne(
					{ name: trimmedTag },
					{ $inc: { total: 1 }, $set: { updated_at: now.toISOString() } }
				);

				// If tag doesn't exist, insert it with total = 1
				if (updateResult.matchedCount === 0) {
					await tagsCollection.insertOne({
						name: trimmedTag,
						total: 1,
						created_at: now.toISOString(),
						updated_at: now.toISOString()
					});
				}
			}
		}

		// Update organizer's updated_at if organizer changed
		if (body.organizer && body.organizer !== existingCompetition.organizer?.toString()) {
			await organizersCollection.updateOne(
				{ _id: new ObjectId(body.organizer) },
				{ $set: { updated_at: now.toISOString() } }
			);
		}

		// Close connection
		await client.close();

		if (result.matchedCount === 0) {
			return json({
				error: 'Failed to update competition',
				status: 500
			}, { status: 500 });
		}

		// Send Telegram notification after successful update
		try {
			await TelegramAPI.sendCompetitionUpdateNotification(id, body.title || 'Competition Updated');
			console.log('Telegram notification sent successfully');
		} catch (telegramError) {
			console.error('Failed to send Telegram notification:', telegramError);
			// Don't fail the request if Telegram notification fails
		}

		return json({
			message: 'Competition updated successfully',
			status: 200,
			data: {
				...updateData,
				_id: id
			}
		});

	} catch (error) {
		console.error('Failed to update competition:', error);

		return json({
			error: 'Failed to update competition',
			message: error instanceof Error ? error.message : 'Unknown error',
			status: 500
		}, { status: 500 });
	}
};
