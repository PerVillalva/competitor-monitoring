// eslint-disable-next-line import/no-extraneous-dependencies
import Slack from '@slack/bolt';
import { log } from 'apify';

import { filterBlogURLs } from './utilFunctions.js';

export async function postSlackMessage(
    initialUrl,
    newUrls,
    pageUpdates,
    newTweets,
    ytData,
    slackChannel,
    slackBotToken,
    slackSignInSecret,
) {
    const separator = '\n⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯';
    const sectionSeparator = '============================================\n';

    const { hostname } = new URL(initialUrl[0].url);
    const parts = hostname.split('.');
    const competitorNameRaw = parts.length > 2 ? parts[1] : parts[0];
    const competitorNameClean = competitorNameRaw.charAt(0).toUpperCase() + competitorNameRaw.slice(1);

    // Prepare Tweets
    let tweetsString;
    if (Array.isArray(newTweets) && newTweets.length > 0) {
        tweetsString = `There are ${newTweets.length} new tweets.`;
        newTweets.forEach((tweet, index) => {
            tweetsString += `${separator}\nTweet ${index + 1}:\nUrl: ${
                tweet.tweetUrl
            }\nAuthor: ${tweet.tweetAuthor}\nText: ${tweet.tweetText}\nDate: ${
                tweet.tweetDate
            }`;
        });
    } else {
        tweetsString = `No new Tweets.`;
    }

    // Prepare New Pages
    const { blogURLs: newBlogPages, remainingURLs: newPages } = filterBlogURLs(newUrls);

    let pagesString = `:page_facing_up: ${newUrls.length} pages were created.`;

    pagesString += newBlogPages.length > 0 ? `${separator}\n:pencil: Blog new pages: ${newBlogPages.length}\n${newBlogPages.join('\n')}${separator}` : '';
    pagesString += newPages.length > 0 ? `\n:bulb: Product new pages: ${newPages.length}\n${newPages.join('\n')}` : '';

    // Prepare Updated Pages
    const { blogURLs: updatedBlogPages, remainingURLs: updatedProductPages } = filterBlogURLs(pageUpdates.map((update) => update.url));

    let updatesString = `:arrows_counterclockwise: ${pageUpdates.length} pages were updated.`;

    // eslint-disable-next-line max-len
    updatesString += updatedBlogPages.length > 0 ? `${separator}\n:pencil: Blog Updates: ${updatedBlogPages.length}\n${updatedBlogPages.join('\n')}${separator}` : '';
    updatesString += updatedProductPages.length > 0 ? `\n:bulb: Product Updates: ${updatedProductPages.length}\n${updatedProductPages.join('\n')}` : '';

    // Prepare YouTube videos
    let ytString;
    if (Array.isArray(ytData) && ytData.length > 0) {
        ytString = `The channel ${ytData[0].channelName} (Subscribers: ${ytData[0].channelSubscribers}) uploaded ${ytData.length} new videos.`;
        ytData.forEach((video, index) => {
            ytString += `${separator}\nVideo ${index + 1}:\nUrl: ${
                video.videoUrl
            }\nTitle: ${video.videoTitle}\nDate: ${video.videoDate}`;
        });
    } else {
        ytString = `No new YouTube videos.`;
    }

    // Send Slack Message
    const app = new Slack.App({
        signingSecret: slackSignInSecret,
        token: slackBotToken,
    });

    await app.client.chat.postMessage({
        token: slackBotToken,
        channel: slackChannel,
        // eslint-disable-next-line max-len
        text: `🆚 Report for: ${competitorNameClean}\n${sectionSeparator}${pagesString}\n${sectionSeparator}${updatesString}\n${sectionSeparator}:bird: Twitter Activity:\n${tweetsString}\n${sectionSeparator}:arrow_forward: YouTube Activity:\n${ytString}\n`,
    });

    log.info('📤 Competitor activity report sent to Slack.');
}
