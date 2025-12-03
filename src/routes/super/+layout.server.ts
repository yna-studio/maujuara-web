import type { LayoutServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { MongoClient, type MongoClientOptions } from 'mongodb';
import { getMongoUri } from '../../configs/mongodb';

export const load: LayoutServerLoad = async ({ cookies }) => {
	const token = cookies.get('session_token');

	// No token: allow access to /super (login page)
	if (!token) {
		return {};
	}

	// Validate token against database before deciding to redirect
	const uri = getMongoUri();
	const client = new MongoClient(uri, {
		serverSelectionTimeoutMS: 10000,
		connectTimeoutMS: 10000
	} as MongoClientOptions);

	try {
		await client.connect();
		const db = client.db();
		const usersCollection = db.collection('users');

		const user = await usersCollection.findOne({ token });

		if (!user) {
			// Invalid or stale token: clear cookie and stay on /super without redirect
			cookies.delete('session_token', { path: '/' });
			return {};
		}

		// Valid session: redirect logged-in user away from login page
		// throw redirect(302, '/super/dashboard');
	} finally {
		await client.close();
	}
};
