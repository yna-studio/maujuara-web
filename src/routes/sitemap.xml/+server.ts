import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	try {
		const baseUrl = url.origin;
		const currentDate = new Date().toISOString();

		const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
	<sitemap>
		<loc>${baseUrl}/sitemap/news</loc>
		<lastmod>${currentDate}</lastmod>
	</sitemap>
	<sitemap>
		<loc>${baseUrl}/sitemap/competitions</loc>
		<lastmod>${currentDate}</lastmod>
	</sitemap>
</sitemapindex>`.trim();

		return new Response(sitemapIndex, {
			headers: {
				'Content-Type': 'application/xml; charset=utf-8',
				'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
			}
		});

	} catch (error) {
		console.error('Error generating sitemap index:', error);
		return new Response('Error generating sitemap index', { status: 500 });
	}
};
