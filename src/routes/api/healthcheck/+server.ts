import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { withDatabase } from '$lib/server/mongodb';

export async function GET() {
	try {
		const { MONGODB_HOST, MONGODB_USER, MONGODB_PASSWORD } = env;
		
		if (!MONGODB_HOST || !MONGODB_USER || !MONGODB_PASSWORD) {
			return json({
				status: 'error',
				message: 'MongoDB environment variables not configured',
				timestamp: new Date().toISOString()
			}, { status: 500 });
		}
		
		// Test database connection with timeout
		await withDatabase(async (db) => {
			// Test database ping
			await db.admin().command({ ping: 1 });
		});
		
		return json({
			status: 'success',
			message: 'System running and database connection successful',
			timestamp: new Date().toISOString()
		});
	} catch (error) {
		console.error('Health check failed:', error);
		
		return json({
			status: 'error',
			message: 'System running but database connection failed',
			error: error instanceof Error ? error.message : 'Unknown error',
			timestamp: new Date().toISOString()
		}, { status: 500 });
	}
}
