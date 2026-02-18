import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { DatabaseService } from '$lib/server/database';
import bcrypt from 'bcryptjs';

export const POST: RequestHandler = async ({ request }) => {
	try {
		// Parse request body
		const body = await request.json();
		const { name, email, password, level, is_active } = body;

		// Validate required fields
		if (!name || typeof name !== 'string' || name.trim() === '') {
			return json(
				{
					error: 'Name is required and must be a non-empty string',
					status: 400
				},
				{ status: 400 }
			);
		}

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

		// Validate level
		const allowedLevels = ['user', 'admin'];
		if (!level || typeof level !== 'string' || !allowedLevels.includes(level)) {
			return json(
				{
					error: "Level must be one of: 'user' or 'admin'",
					status: 400
				},
				{ status: 400 }
			);
		}

		// Validate is_active if provided (otherwise default later)
		if (typeof is_active !== 'undefined' && typeof is_active !== 'boolean') {
			return json(
				{
					error: 'is_active must be a boolean when provided',
					status: 400
				},
				{ status: 400 }
			);
		}

		// Timestamps
		const currentTime = new Date().toISOString();

		// Hash password
		const saltRounds = 10;
		const hashedPassword = await bcrypt.hash(password.trim(), saltRounds);

		// Build user document
		const newUser = {
			name: name.trim(),
			email: email.trim(),
			password: hashedPassword,
			level,
			is_active: typeof is_active === 'boolean' ? is_active : false,
			created_date: currentTime,
			updated_date: currentTime
		};

		// Insert into database
		const result = await DatabaseService.insertOne('users', newUser);

		// Return created user (excluding password in response)
		const { password: _password, ...safeUser } = newUser;

		return json(
			{
				data: {
					_id: result.insertedId.toString(),
					...safeUser
				},
				status: 201,
				message: 'User created successfully'
			},
			{ status: 201 }
		);
	} catch (error) {
		console.error('Failed to create user:', error);

		return json(
			{
				error: 'Failed to create user',
				message: error instanceof Error ? error.message : 'Unknown error',
				status: 500
			},
			{ status: 500 }
		);
	}
};
