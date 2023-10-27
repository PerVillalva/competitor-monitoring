import { Actor } from 'apify';

import { sitemapScraper } from './crawlers/sitemapScraper.js';
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
                console.log('New pages:', differences);
                await Actor.setValue('NEW_PAGES', { newUrls: differences });

                // Get newly added pages' urls from the KeyValueStore

                const addedUrls = await (await KVS).getValue('NEW_PAGES');
                newPages = addedUrls.newUrls;
            } else {
                console.log('No new pages found.');
                newPages = [];
            }

            if (updates.length) {
                console.log('New updates:', updates);
                await Actor.setValue('PAGE_UPDATES', { updates });

                const pageUpdates = await (await KVS).getValue('PAGE_UPDATES');
                updatedPages = pageUpdates.updates;
            } else {
                console.log('No pages were updated.');
                updatedPages = [];
            }

            // Fetch Twitter data
            let twitterData;

            if (twitterProfile) {
                twitterData = await fetchTwitterData(
                    twitterProfile,
                    twitterFilterTerm,
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
            console.error('Error occurred:', error.message);
        }
    }
    await main();
    await Actor.exit();
})();
