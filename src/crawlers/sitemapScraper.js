import { Actor, Dataset } from 'apify';
import { CheerioCrawler } from 'crawlee';

export async function sitemapScraper(startUrls, proxyConfig) {
    const proxyConfiguration = await Actor.createProxyConfiguration(
        proxyConfig,
    );

    const crawler = new CheerioCrawler({
        proxyConfiguration,
        async requestHandler({ $, log }) {
            log.info('Extracting Sitemap URLs');

            const sitemapData = $('urlset url')
                .map((_, el) => {
                    const url = $(el).find('loc').text();
                    const lastModRaw = $(el).find('lastmod').text();
                    const cleanedLastMod = lastModRaw
                        ? lastModRaw.split('T')[0]
                        : null;

                    return cleanedLastMod
                        ? { url, lastMod: cleanedLastMod }
                        : { url };
                })
                .get();

            // Save url and title to Dataset - a table-like storage.
            log.info('Pushing data to Dataset');
            await Dataset.pushData(sitemapData);
        },
    });
    await crawler.run(startUrls);
}
