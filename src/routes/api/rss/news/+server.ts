import type { RequestHandler } from './$types';
import { DatabaseService } from '$lib/server/database';

export const GET: RequestHandler = async ({ url }) => {
	try {
		// Get base URL from request
		const baseUrl = url.origin;

		// Fetch all news with user data, no limit for SEO
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
			},
			{
				$sort: {
					updated_at: -1
				}
			}
		]);

		// Generate RSS XML
		const rssItems = news.map((item: any) => {
			const pubDate = new Date(item.updated_at || item.created_at).toUTCString();
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
				</item>
			`.trim();
		}).join('\n');

		const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
	<channel>
		<title>Maujuara News Feed</title>
		<description>Latest news and updates from Maujuara</description>
		<link>${baseUrl}</link>
		<atom:link href="${baseUrl}/api/rss/news" rel="self" type="application/rss+xml" />
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
