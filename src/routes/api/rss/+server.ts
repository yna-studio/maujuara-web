import type { RequestHandler } from './$types';
import { DatabaseService } from '$lib/server/database';

export const GET: RequestHandler = async ({ url }) => {
	try {
		// Get base URL from request
		const baseUrl = url.origin;

		// Fetch news with user data
		const news = await DatabaseService.aggregate('news', [
			{
				$match: {
					status: 'published'
				}
			},
			{
				$lookup: {
					from: 'users',
					localField: 'created_by',
					foreignField: '_id',
					as: 'user'
				}
			},
			{
				$unwind: {
					path: '$user',
					preserveNullAndEmptyArrays: true
				}
			},
			{
				$project: {
					_id: 1,
					title: 1,
					content: 1,
					thumbnail: 1,
					tags: 1,
					created_at: 1,
					updated_at: 1,
					createdBy: {
						$cond: {
							if: { $ne: ['$user', null] },
							then: {
								id: { $toString: '$user._id' },
								name: '$user.name',
								avatar: '$user.avatar'
							},
							else: null
						}
					},
					shortDesc: {
						$let: {
							vars: {
								strippedContent: {
									$reduce: {
										input: {
											$split: [
												{
													$replaceAll: {
														input: '$content',
														find: '<[^>]*>',
														replacement: ''
													}
												},
												'\n'
											]
										},
										initialValue: '',
										in: {
											$concat: ['$$value', '$$this']
										}
									}
								}
							},
							in: {
								$cond: {
									if: {
										$gt: [
											{
												$strLenCP: {
													$trim: {
														input: '$$strippedContent'
													}
												}
											},
											150
										]
									},
									then: {
										$concat: [
											{
												$substrCP: [
													{
														$trim: {
															input: '$$strippedContent'
														}
													},
													0,
													147
												]
											},
											'...'
										]
									},
									else: {
										$trim: {
											input: '$$strippedContent'
										}
									}
								}
							}
						}
					}
				}
			}
		]);

		// Fetch competitions with category and organizer data
		const competitions = await DatabaseService.find('competitions', {}, {
			sort: { updated_date: -1 }
		});

		// Combine and sort all items by latest update
		const allItems = [
			...news.map((item: any) => ({
				...item,
				type: 'news',
				date: new Date(item.updated_at || item.created_at)
			})),
			...competitions.map((item: any) => ({
				...item,
				type: 'competition',
				date: new Date(item.updated_date || item.created_at || item.deadline_date)
			}))
		].sort((a, b) => b.date.getTime() - a.date.getTime());

		// Generate RSS XML
		const rssItems = allItems.map((item: any) => {
			const pubDate = item.date.toUTCString();
			
			if (item.type === 'news') {
				const guid = `${baseUrl}/news/detail/${item.title
					.toLowerCase()
					.replace(/[^\w\s-]/g, '')
					.replace(/[\s_-]+/g, '-')
					.replace(/^-+|-+$/g, '')}-${item._id}`;
				
				return `
					<item>
						<title><![CDATA[${item.title}]]></title>
						<description><![CDATA[${item.shortDesc}]]></description>
						<link>${guid}</link>
						<guid isPermaLink="true">${guid}</guid>
						<pubDate>${pubDate}</pubDate>
						${item.updated_at && item.updated_at !== item.created_at ? `<lastBuildDate>${new Date(item.updated_at).toUTCString()}</lastBuildDate>` : ''}
						${item.thumbnail ? `<enclosure url="${item.thumbnail}" type="image/jpeg" />` : ''}
						${item.createdBy ? `<author><![CDATA[${item.createdBy.name}]]></author>` : ''}
						${item.tags && item.tags.length > 0 ? `<category>${item.tags.join(',')}</category>` : ''}
						<category>News</category>
					</item>
				`.trim();
			} else {
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
			}
		}).join('\n');

		const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
	<channel>
		<title>Maujuara - News & Competitions Feed</title>
		<description>Latest news and competitions from Maujuara</description>
		<link>${baseUrl}</link>
		<atom:link href="${baseUrl}/api/rss" rel="self" type="application/rss+xml" />
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
		console.error('Error generating combined RSS feed:', error);
		return new Response('Error generating RSS feed', { status: 500 });
	}
};
