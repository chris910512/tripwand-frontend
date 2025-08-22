import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
    const site = 'https://tripwand.online';
    const pages = [
        {
            url: '',
            changefreq: 'daily',
            priority: '1.0',
            lastmod: new Date().toISOString()
        }
    ];

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages
    .map(
        (page) => `
    <url>
        <loc>${site}${page.url}</loc>
        <lastmod>${page.lastmod}</lastmod>
        <changefreq>${page.changefreq}</changefreq>
        <priority>${page.priority}</priority>
    </url>`
    )
    .join('')}
</urlset>`.trim();

    return new Response(sitemap, {
        headers: {
            'Content-Type': 'application/xml',
            'Cache-Control': 'max-age=3600'
        }
    });
};