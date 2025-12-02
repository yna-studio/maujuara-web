import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { MongoClient, type MongoClientOptions } from 'mongodb';
import { getMongoUri } from '../../../../configs/mongodb';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export const POST: RequestHandler = async ({ request, cookies }) => {
	try {
		const body = await request.json();
		const { email, password } = body;

		// Validate payload
		if (!email || typeof email !== 'string' || email.trim() === '') {
			return json(
				{
					error: 'Email is required and must be a non-empty string',
					status: 400
				},
				{ status: 400 }
			);
		}

		if (!password || typeof password !== 'string' || password.trim() === '') {
			return json(
				{
					error: 'Password is required and must be a non-empty string',
					status: 400
				},
				{ status: 400 }
			);
		}

		const uri = getMongoUri();

		const client = new MongoClient(uri, {
			serverSelectionTimeoutMS: 10000,
			connectTimeoutMS: 10000
		} as MongoClientOptions);

		await client.connect();
		const db = client.db();
		const usersCollection = db.collection('users');

		// Find user by email
		const user = await usersCollection.findOne({ email: email.trim() });

		if (!user) {
			await client.close();
			return json(
				{
					error: 'Invalid email or password',
					status: 401
				},
				{ status: 401 }
			);
		}

		// Verify password
		const passwordMatch = await bcrypt.compare(password.trim(), user.password);

		if (!passwordMatch) {
			await client.close();
			return json(
				{
					error: 'Invalid email or password',
					status: 401
				},
				{ status: 401 }
			);
		}

		// Generate token
		const token = crypto.randomBytes(32).toString('hex');

		// Update user document with token
		await usersCollection.updateOne(
			{ _id: user._id },
			{
				$set: {
					token,
					updated_date: new Date().toISOString()
				}
			}
		);

		// Set session cookie for frontend usage
		cookies.set('session_token', token, {
			path: '/',
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax'
		});

		await client.close();

		return json(
			{
				data: {
					name: user.name,
					email: user.email,
					is_active: user.is_active,
					level: user.level,
					token
				},
				status: 200,
				message: 'Login successful'
			},
			{ status: 200 }
		);
	} catch (error) {
		console.error('Failed to login user:', error);

		return json(
			{
				error: 'Failed to login user',
				message: error instanceof Error ? error.message : 'Unknown error',
				status: 500
			},
			{ status: 500 }
		);
	}
};
