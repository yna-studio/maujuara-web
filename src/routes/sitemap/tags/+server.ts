import type { RequestHandler } from './$types';
import { MongoClient, type MongoClientOptions } from 'mongodb';
import { getMongoUri } from '../../../configs/mongodb';

export const GET: RequestHandler = async ({ url }) => {
	let client;
	try {
		// Get base URL from request
		const baseUrl = url.origin;
		const uri = getMongoUri();
		
		// Create MongoDB client
		client = new MongoClient(uri, {
			maxPoolSize: 10,
			serverSelectionTimeoutMS: 5000,
			socketTimeoutMS: 45000,
		});

		// Connect to database
		await client.connect();
		const db = client.db('maujuara');
		const tagsCollection = db.collection('tags');

		// Fetch all tags with total > 0, no limit for SEO
		const tags = await tagsCollection
			.find(
				{ total: { $gt: 0 } },
				{
					projection: {
						name: 1,
						total: 1,
						updated_at: 1,
						created_at: 1
					}
				}
			)
			.sort({ total: -1 })
			.toArray();

		// Generate sitemap URLs
		const sitemapUrls = tags.map((tag: any) => {
			const lastmod = tag.updated_at || tag.created_at || new Date();
			
			// Set priority based on tag popularity
			const priority = tag.total > 50 ? '0.8' : tag.total > 10 ? '0.6' : '0.4';
			
			return `
				<url>
					<loc>${baseUrl}/competitions?tag=${encodeURIComponent(tag.name)}</loc>
					<lastmod>${new Date(lastmod).toISOString()}</lastmod>
					<changefreq>weekly</changefreq>
					<priority>${priority}</priority>
				</url>
			`.trim();
		}).join('\n');

		const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
	${sitemapUrls}
</urlset>`.trim();

		return new Response(sitemapXml, {
			headers: {
				'Content-Type': 'application/xml; charset=utf-8',
				'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
			}
		});

	} catch (error) {
		console.error('Error generating tags sitemap:', error);
		return new Response('Error generating sitemap', { status: 500 });
	} finally {
		// Close MongoDB connection
		if (client) {
			client.close();
		}
	}
};
