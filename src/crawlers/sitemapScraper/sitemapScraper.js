import { Actor } from 'apify';
import { CheerioCrawler } from 'crawlee';

import { router } from './routes.js';

export async function sitemapScraper(startUrls, proxyConfig) {
    const proxyConfiguration = await Actor.createProxyConfiguration(
        proxyConfig,
    );

    const crawler = new CheerioCrawler({
        proxyConfiguration,
        requestHandler: router,
    });

    await crawler.run(startUrls);
}
