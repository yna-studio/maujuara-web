import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { v2 as cloudinary } from 'cloudinary';
import { env } from '$env/dynamic/private';
import { getMongoUri } from '../../../configs/mongodb';
import { MongoClient } from 'mongodb';
import axios from 'axios';

// Configure Cloudinary (same as cloudinary.ts)
cloudinary.config({
	cloud_name: env.CLOUDINARY_CLOUD_NAME,
	api_key: env.CLOUDINARY_API_KEY,
	api_secret: env.CLOUDINARY_API_SECRET,
	secure: true
});

interface QuotaInfo {
	service: string;
	status: 'ok' | 'warning' | 'error';
	message: string;
	details?: Record<string, any>;
}

/**
 * Check Cloudinary quota and usage
 */
async function checkCloudinaryQuota(): Promise<QuotaInfo> {
	try {
		if (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET) {
			return {
				service: 'Cloudinary',
				status: 'error',
				message: 'Cloudinary credentials not configured'
			};
		}

		// Test Cloudinary connection by getting account details
		const accountDetails = await cloudinary.api.ping();
		
		// Get usage statistics (if available)
		let usageInfo: any = {};
		try {
			// Try to get usage statistics
			// Note: This requires Admin API access
			const usage = await cloudinary.api.usage();
			usageInfo = {
				credits: usage.credits,
				bandwidth: usage.bandwidth,
				storage: usage.storage,
				requests: usage.requests,
				resources: usage.resources,
				derived_resources: usage.derived_resources,
				transformations: usage.transformations
			};
		} catch (error) {
			// Usage API might not be available on free tier
			usageInfo = {
				note: 'Usage statistics may require paid plan',
				ping: accountDetails.status === 'ok' ? 'Connected' : 'Failed'
			};
		}

		return {
			service: 'Cloudinary',
			status: accountDetails.status === 'ok' ? 'ok' : 'error',
			message: accountDetails.status === 'ok' 
				? 'Cloudinary is accessible' 
				: 'Cloudinary connection failed',
			details: {
				cloud_name: env.CLOUDINARY_CLOUD_NAME,
				...usageInfo
			}
		};
	} catch (error) {
		return {
			service: 'Cloudinary',
			status: 'error',
			message: error instanceof Error ? error.message : 'Failed to check Cloudinary quota',
			details: {
				error: error instanceof Error ? error.stack : String(error)
			}
		};
	}
}

/**
 * Check MongoDB connection and database status
 */
async function checkMongoDBQuota(): Promise<QuotaInfo> {
	let client: MongoClient | null = null;
	try {
		if (!env.MONGODB_HOST || !env.MONGODB_USER || !env.MONGODB_PASSWORD) {
			return {
				service: 'MongoDB',
				status: 'error',
				message: 'MongoDB credentials not configured'
			};
		}

		const uri = getMongoUri();
		client = new MongoClient(uri, {
			serverSelectionTimeoutMS: 5000,
			connectTimeoutMS: 5000
		});

		await client.connect();
		const db = client.db();
		
		// Get database stats
		const stats = await db.stats();
		
		// Get collection counts
		const collections = await db.listCollections().toArray();
		const collectionCounts: Record<string, number> = {};
		
		for (const collection of collections) {
			const count = await db.collection(collection.name).countDocuments();
			collectionCounts[collection.name] = count;
		}

		return {
			service: 'MongoDB',
			status: 'ok',
			message: 'MongoDB is accessible',
			details: {
				database: db.databaseName,
				collections: collections.length,
				collection_counts: collectionCounts,
				data_size: stats.dataSize,
				storage_size: stats.storageSize,
				indexes: stats.indexes,
				index_size: stats.indexSize
			}
		};
	} catch (error) {
		return {
			service: 'MongoDB',
			status: 'error',
			message: error instanceof Error ? error.message : 'Failed to check MongoDB quota',
			details: {
				error: error instanceof Error ? error.stack : String(error)
			}
		};
	} finally {
		if (client) {
			await client.close();
		}
	}
}

/**
 * Check Telegram Bot API status and rate limits
 */
async function checkTelegramQuota(): Promise<QuotaInfo> {
	try {
		const token = env.TELEGRAM_MJUR_TOKEN;
		if (!token) {
			return {
				service: 'Telegram',
				status: 'warning',
				message: 'Telegram token not configured'
			};
		}

		// Test Telegram API by calling getMe
		const url = `https://api.telegram.org/bot${token}/getMe`;
		const response = await axios.get(url, {
			timeout: 5000,
			headers: {
				'Content-Type': 'application/json'
			}
		});

		if (response.data.ok) {
			const botInfo = response.data.result;
			
			// Check rate limit headers if available
			const rateLimitHeaders: Record<string, string> = {};
			if (response.headers['x-ratelimit-limit']) {
				rateLimitHeaders.limit = response.headers['x-ratelimit-limit'];
			}
			if (response.headers['x-ratelimit-remaining']) {
				rateLimitHeaders.remaining = response.headers['x-ratelimit-remaining'];
			}
			if (response.headers['x-ratelimit-reset']) {
				rateLimitHeaders.reset = response.headers['x-ratelimit-reset'];
			}

			return {
				service: 'Telegram',
				status: 'ok',
				message: 'Telegram Bot API is accessible',
				details: {
					bot_id: botInfo.id,
					bot_username: botInfo.username,
					bot_first_name: botInfo.first_name,
					can_join_groups: botInfo.can_join_groups,
					can_read_all_group_messages: botInfo.can_read_all_group_messages,
					supports_inline_queries: botInfo.supports_inline_queries,
					rate_limits: Object.keys(rateLimitHeaders).length > 0 ? rateLimitHeaders : {
						note: 'Rate limit headers not available. Default limits: 30 messages/second per bot, 1 message/second per chat'
					}
				}
			};
		} else {
			return {
				service: 'Telegram',
				status: 'error',
				message: response.data.description || 'Telegram API returned error',
				details: {
					error_code: response.data.error_code
				}
			};
		}
	} catch (error) {
		return {
			service: 'Telegram',
			status: 'error',
			message: error instanceof Error ? error.message : 'Failed to check Telegram quota',
			details: {
				error: axios.isAxiosError(error) 
					? error.response?.data?.description || error.message
					: String(error)
			}
		};
	}
}

/**
 * GET handler to check quota limits for all services
 */
export const GET: RequestHandler = async () => {
	try {
		// Check all services in parallel
		const [cloudinaryQuota, mongoDBQuota, telegramQuota] = await Promise.all([
			checkCloudinaryQuota(),
			checkMongoDBQuota(),
			checkTelegramQuota()
		]);

		const allQuotas = [cloudinaryQuota, mongoDBQuota, telegramQuota];
		
		// Determine overall status
		const hasError = allQuotas.some(q => q.status === 'error');
		const hasWarning = allQuotas.some(q => q.status === 'warning');
		const overallStatus = hasError ? 'error' : hasWarning ? 'warning' : 'ok';

		return json({
			status: overallStatus,
			timestamp: new Date().toISOString(),
			services: allQuotas,
			summary: {
				total: allQuotas.length,
				ok: allQuotas.filter(q => q.status === 'ok').length,
				warning: allQuotas.filter(q => q.status === 'warning').length,
				error: allQuotas.filter(q => q.status === 'error').length
			}
		}, { status: 200 });
	} catch (error) {
		console.error('Failed to check quota limits:', error);
		return json({
			status: 'error',
			message: 'Failed to check quota limits',
			error: error instanceof Error ? error.message : 'Unknown error',
			timestamp: new Date().toISOString()
		}, { status: 500 });
	}
};
