import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { DatabaseService } from '$lib/server/database';
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

		// Find user by email
		const user = await DatabaseService.findOne('users', { email: email.trim() });

		if (!user) {
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
		await DatabaseService.updateOne(
			'users',
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
