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

		const competitionsCollection = db.collection('competitions');
		const organizersCollection = db.collection('organizers');

		// Get current date for filtering
		const now = new Date();
		const currentYear = now.getFullYear();
		const startOfYear = new Date(currentYear, 0, 1); // January 1st of current year
		const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59, 999); // December 31st of current year

		// Get all counts in parallel
		const [
			totalCompetitions,
			activeCompetitions,
			totalOrganizers,
			competitionsThisYear
		] = await Promise.all([
			// Total competitions
			competitionsCollection.countDocuments(),

			// Active competitions (now <= announcement_date)
			competitionsCollection.countDocuments({
				announcement_date: { $gte: now.toISOString() }
			}),

			// Total organizers
			organizersCollection.countDocuments(),

			// Competitions this year
			competitionsCollection.countDocuments({
				deadline_date: { $gte: startOfYear.toISOString() },
				announcement_date: { $lte: endOfYear.toISOString() }
			})
		]);

		// Calculate total prize this year
		const prizeAggregation = await competitionsCollection.aggregate([
			{
				$match: {
					deadline_date: { $gte: startOfYear.toISOString() },
					announcement_date: { $lte: endOfYear.toISOString() },
					prize_estimate: { $exists: true, $ne: null }
				}
			},
			{
				$group: {
					_id: null,
					totalPrize: { $sum: '$prize_estimate' }
				}
			}
		]).toArray();

		const prizeThisYear = prizeAggregation.length > 0 ? prizeAggregation[0].totalPrize : 0;

		// Close connection
		await client.close();

		// Return stats
		return json({
			data: {
				active_competition: activeCompetitions,
				total_competition: totalCompetitions,
				total_organizers: totalOrganizers,
				prize_this_year: prizeThisYear,
				competitions_this_year: competitionsThisYear
			},
			status: 200,
			meta: {
				generated_at: now.toISOString(),
				year: currentYear
			}
		});

	} catch (error) {
		console.error('Failed to fetch stats:', error);

		return json({
			error: 'Failed to fetch statistics from database',
			message: error instanceof Error ? error.message : 'Unknown error',
			status: 500
		}, { status: 500 });
	}
};
