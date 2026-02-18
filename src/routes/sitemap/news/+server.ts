import type { RequestHandler } from './$types';
import { DatabaseService } from '$lib/server/database';

export const GET: RequestHandler = async ({ url }) => {
	try {
		// Get base URL from request
		const baseUrl = url.origin;

		// Fetch all news, no limit for SEO
		const news = await DatabaseService.find('news', {}, {
			projection: {
				_id: 1,
				title: 1,
				created_at: 1,
				updated_at: 1
			},
			sort: { updated_at: -1 }
		});

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
	}
};
