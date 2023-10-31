import { Actor, log } from 'apify';

import { sitemapScraper } from './crawlers/sitemapScraper/sitemapScraper.js';
import { fetchTwitterData } from './crawlers/twitterScraper.js';
import { fetchYoutubeData } from './crawlers/youtubeScraper.js';
import {
    fetchCurrentDatasetItems,
    fetchPreviousDatasetItems,
} from './data/fetchData.js';
import { compareDatasets, monitorUpdates } from './data/monitorChanges.js';
import { postSlackMessage } from './slack/sendMessage.js';

(async () => {
    await Actor.init();
    async function main() {
        try {
            const {
                startUrls,
                proxyConfig,
                twitterProfile,
                twitterFilterTerm,
                twitterLastNDays,
                ytChannel,
                ytLastNDays,
                ytMaxResults,
                slackChannel,
                slackBotToken,
                slackSignInSecret,
            } = await Actor.getInput();

            const initialUrls = startUrls.map((url) => {
                const req = url.url
                    ? url
                    : {
                        url,
                    };
                return req;
            });

            // Get Sitemaps data
            await sitemapScraper(initialUrls, proxyConfig);

            // Compare previous data to current
            const oldDataset = await fetchPreviousDatasetItems();
            const newDataset = await fetchCurrentDatasetItems();
            const differences = await compareDatasets(oldDataset, newDataset);
            const updates = await monitorUpdates(newDataset);

            // Check if any new pages were added since the previous run
            let newPages;
            let updatedPages;

            const KVS = Actor.openKeyValueStore();

            if (differences.length) {
                log.info('New pages:', differences);
                await Actor.setValue('NEW_PAGES', { newUrls: differences });

                // Get newly added pages' urls from the KeyValueStore

                const addedUrls = await (await KVS).getValue('NEW_PAGES');
                newPages = addedUrls.newUrls;
            } else {
                log.info('No new pages found.');
                newPages = [];
            }

            if (updates.length) {
                log.info('New updates:', updates);
                await Actor.setValue('PAGE_UPDATES', { updates });

                const pageUpdates = await (await KVS).getValue('PAGE_UPDATES');
                updatedPages = pageUpdates.updates;
            } else {
                log.info('No pages were updated.');
                updatedPages = [];
            }

            // Fetch Twitter data
            let twitterData;

            if (twitterProfile) {
                twitterData = await fetchTwitterData(
                    twitterProfile,
                    twitterFilterTerm,
                    twitterLastNDays,
                );
            }

            // Fetch YouTube data
            let ytData;

            if (ytChannel) {
                ytData = await fetchYoutubeData(
                    ytChannel,
                    ytLastNDays,
                    ytMaxResults,
                );
            }

            // Send competitors' report to Slack
            if (slackSignInSecret) {
                await postSlackMessage(
                    initialUrls,
                    newPages,
                    updatedPages,
                    twitterData,
                    ytData,
                    slackChannel,
                    slackBotToken,
                    slackSignInSecret,
                );
            }
        } catch (error) {
            log.info('Error occurred:', error.message);
        }
    }
    await main();
    await Actor.exit();
})();
