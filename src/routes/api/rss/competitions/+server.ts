import type { RequestHandler } from './$types';
import { DatabaseService } from '$lib/server/database';

export const GET: RequestHandler = async ({ url }) => {
	try {
		// Get base URL from request
		const baseUrl = url.origin;

		// Fetch all competitions, no limit for SEO
		const competitions = await DatabaseService.find('competitions', {}, {
			sort: { updated_date: -1 }
		});

		// Generate RSS XML
		const rssItems = competitions.map((item: any) => {
			const pubDate = new Date(item.updated_date || item.created_at || item.deadline_date).toUTCString();
			const guid = `${baseUrl}/competitions/detail/${item.title
				.toLowerCase()
				.replace(/[^\w\s-]/g, '')
				.replace(/[\s_-]+/g, '-')
				.replace(/^-+|-+$/g, '')}-${item._id}`;
			
			// Generate short description in JavaScript
			const shortDesc = item.description ? 
				item.description
					.replace(/<[^>]*>/g, '')
					.replace(/\s+/g, ' ')
					.trim()
					.substring(0, 150) + (item.description.length > 150 ? '...' : '') : '';
			
			return `
				<item>
					<title><![CDATA[${item.title}]]></title>
					<description><![CDATA[${shortDesc}]]></description>
					<link>${guid}</link>
					<guid isPermaLink="true">${guid}</guid>
					<pubDate>${pubDate}</pubDate>
					${item.poster ? `<enclosure url="${item.poster}" type="image/jpeg" />` : ''}
					<category>Competition</category>
				</item>
			`.trim();
		}).join('\n');

		const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
	<channel>
		<title>Maujuara Competitions Feed</title>
		<description>Latest competitions from Maujuara</description>
		<link>${baseUrl}</link>
		<atom:link href="${baseUrl}/api/rss/competitions" rel="self" type="application/rss+xml" />
		<language>id-ID</language>
		<lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
		${rssItems}
	</channel>
</rss>`.trim();

		return new Response(rssXml, {
			headers: {
				'Content-Type': 'application/rss+xml; charset=utf-8',
				'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
			}
		});

	} catch (error) {
		console.error('Error generating RSS feed:', error);
		return new Response('Error generating RSS feed', { status: 500 });
	}
};
