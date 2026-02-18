import type { RequestHandler } from './$types';
import { DatabaseService } from '$lib/server/database';

export const GET: RequestHandler = async ({ url }) => {
	try {
		// Get base URL from request
		const baseUrl = url.origin;

		// Fetch all tags with total > 0, no limit for SEO
		const tags = await DatabaseService.find('tags', { total: { $gt: 0 } }, {
			projection: {
				name: 1,
				total: 1,
				updated_at: 1,
				created_at: 1
			},
			sort: { total: -1 }
		});

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
	}
};
