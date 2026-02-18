import type { RequestHandler } from './$types';
import { DatabaseService } from '$lib/server/database';

export const GET: RequestHandler = async ({ url }) => {
	try {
		// Get base URL from request
		const baseUrl = url.origin;

		// Fetch all competitions, no limit for SEO
		const competitions = await DatabaseService.find('competitions', {}, {
			projection: {
				_id: 1,
				title: 1,
				created_at: 1,
				updated_date: 1,
				deadline_date: 1
			},
			sort: { updated_date: -1 }
		});

		// Generate sitemap URLs
		const sitemapUrls = competitions.map((item: any) => {
			const lastmod = item.updated_date || item.created_at;
			const slug = item.title
				.toLowerCase()
				.replace(/[^\w\s-]/g, '')
				.replace(/[\s_-]+/g, '-')
				.replace(/^-+|-+$/g, '');
			
			// Set priority based on competition status
			const now = new Date();
			const deadline = new Date(item.deadline_date);
			const isExpired = deadline < now;
			const priority = isExpired ? '0.5' : '0.8';
			
			return `
				<url>
					<loc>${baseUrl}/competitions/detail/${slug}-${item._id}</loc>
					<lastmod>${new Date(lastmod).toISOString()}</lastmod>
					<changefreq>daily</changefreq>
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
		console.error('Error generating competitions sitemap:', error);
		return new Response('Error generating sitemap', { status: 500 });
	}
};
