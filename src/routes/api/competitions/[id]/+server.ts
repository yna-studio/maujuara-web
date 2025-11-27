import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { MongoClient, ObjectId, type MongoClientOptions } from 'mongodb';
import { getMongoUri } from '../../../../configs/mongodb';

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
