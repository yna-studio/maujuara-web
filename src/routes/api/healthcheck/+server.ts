import { MongoClient, type MongoClientOptions } from 'mongodb';
import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

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
		
		const strippedHost = MONGODB_HOST.replace(/^mongodb\+srv:\/\//, '');
		const uri = `mongodb+srv://${encodeURIComponent(MONGODB_USER)}:${encodeURIComponent(MONGODB_PASSWORD)}@${strippedHost}`;
		
		const client = new MongoClient(uri, {
			serverSelectionTimeoutMS: 10000, // 10 seconds timeout
			connectTimeoutMS: 10000 // 10 seconds connection timeout
		} as MongoClientOptions);
		
		// Test the connection with timeout
		const connectionPromise = client.connect();
		const pingPromise = connectionPromise.then(() => 
			client.db('admin').command({ ping: 1 })
		);
		
		// Set timeout for the entire operation
		const timeoutPromise = new Promise((_, reject) => {
			setTimeout(() => reject(new Error('Database connection timeout after 10 seconds')), 10000);
		});
		
		await Promise.race([pingPromise, timeoutPromise]);
		await client.close();
		
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
