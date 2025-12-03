import type { LayoutServerLoad } from './$types';
import { MongoClient, type MongoClientOptions } from 'mongodb';
import { getMongoUri } from '../../../configs/mongodb';
import { redirect } from '@sveltejs/kit';

export const load: LayoutServerLoad = async ({ cookies }) => {
	const token = cookies.get('session_token');

	if (!token) {
		throw redirect(302, '/super');
	}

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
			// Token exists but does not correspond to a user anymore.
			// Clear the cookie to avoid redirect loops between /super and /super/dashboard.
			cookies.delete('session_token', { path: '/' });
			throw redirect(302, '/super');
		}

		return {
			user: {
				name: user.name,
				email: user.email,
				is_active: user.is_active,
				level: user.level
			}
		};
	} finally {
		await client.close();
	}
};
