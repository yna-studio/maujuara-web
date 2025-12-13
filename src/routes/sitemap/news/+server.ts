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
		const newsCollection = db.collection('news');

		// Fetch all published news, no limit for SEO
		const news = await newsCollection
			.find(
				{ status: 'published' },
				{
					projection: {
						_id: 1,
						title: 1,
						created_at: 1,
						updated_at: 1
					}
				}
			)
			.sort({ updated_at: -1 })
			.toArray();

		// Generate sitemap URLs
		const sitemapUrls = news.map((item: any) => {
			const lastmod = item.updated_at || item.created_at;
			const slug = item.title
				.toLowerCase()
				.replace(/[^\w\s-]/g, '')
				.replace(/[\s_-]+/g, '-')
				.replace(/^-+|-+$/g, '');
			
			return `
				<url>
					<loc>${baseUrl}/news/detail/${slug}-${item._id}</loc>
					<lastmod>${new Date(lastmod).toISOString()}</lastmod>
					<changefreq>weekly</changefreq>
					<priority>0.7</priority>
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
		console.error('Error generating news sitemap:', error);
		return new Response('Error generating sitemap', { status: 500 });
	} finally {
		// Close MongoDB connection
		if (client) {
			client.close();
		}
	}
};
