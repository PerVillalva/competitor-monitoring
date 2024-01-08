import Slack from '@slack/bolt';
import { log } from 'apify';

import {
    generateBlock,
    generateTwitterBlock,
    generateUpdatedProductBlock,
    generateUpdatedBlogBlock,
    generateNewBlogBlock,
    generateNewProductBlock,
    generateYTBlock,
} from './slackBlock.js';
import { filterBlogURLs } from './utilFunctions.js';

export async function postSlackMessage(
    ytLastNDays,
    twitterProfile,
    initialUrl,
    newUrls,
    pageUpdates,
    newTweets,
    ytData,
    slackChannel,
    slackBotToken,
    slackSignInSecret,
) {
    const { hostname } = new URL(initialUrl[0].url);
    const parts = hostname.split('.');
    const competitorNameRaw = parts.length > 2 ? parts[1] : parts[0];
    const competitorNameClean = competitorNameRaw.charAt(0).toUpperCase() + competitorNameRaw.slice(1);

    // Prepare Tweets
    const newTweetsArr = [];
    (newTweets || []).forEach((tweet) => {
        const {
            tweetAuthor,
            tweetAvatar,
            tweetUrl,
            tweetText,
            tweetImage,
            tweetDate,
            tweetLikes,
            tweetRetweets,
            tweetReplies,
            inReplyTo,
        } = tweet;

        // Generate Slack JSON block
        newTweetsArr(...generateTwitterBlock(
            tweetAuthor,
            tweetAvatar,
            tweetDate,
            tweetText,
            tweetUrl,
            tweetImage,
            tweetLikes,
            tweetRetweets,
            tweetReplies,
            inReplyTo,
        ));
    });

    // Prepare New Pages
    const { blogPages: newBlogPages, productPages: newProductPages } = filterBlogURLs(newUrls);

    const newBlogPagesArr = [];
    const newProductPagesArr = [];

    (newBlogPages || []).forEach(({ url }) => {
        newBlogPagesArr.push(generateNewBlogBlock(url));
    });

    (newProductPages || []).forEach(({ url }) => {
        newProductPagesArr.push(generateNewProductBlock(url));
    });

    // Prepare Updated Page
    const { blogPages: updatedBlogPages, productPages: updatedProductPages } = filterBlogURLs(pageUpdates.map((update) => update.url));

    const updatedBlogPagesArr = [];
    const updatedProductPagesArr = [];

    (updatedBlogPages || []).forEach(({ url }) => {
        updatedBlogPagesArr.push(generateUpdatedBlogBlock(url));
    });

    (updatedProductPages || []).forEach(({ url }) => {
        updatedProductPagesArr.push(generateUpdatedProductBlock(url));
    });

    // Prepare YouTube videos
    const newYtVideosArr = [];
    (ytData || []).forEach((video) => {
        const {
            videoDate,
            videoViewCount,
            videoUrl,
            videoTitle,
            videoDuration,
            videoThumbnail,
            videoLikes,
            videoComments,
        } = video;

        newYtVideosArr.push(...generateYTBlock(
            videoUrl,
            videoTitle,
            videoThumbnail,
            videoViewCount,
            videoLikes,
            videoComments,
            videoDuration,
            videoDate,
        ));
    });

    // Create master Slack block
    const slackMessageBlock = generateBlock(
        competitorNameClean,
        (newUrls ? newUrls.length : 0),
        newBlogPagesArr,
        newProductPagesArr,
        (pageUpdates ? pageUpdates.length : 0),
        updatedBlogPagesArr,
        updatedProductPagesArr,
        twitterProfile,
        (newTweets ? newTweets.length : 0),
        newTweetsArr,
        (ytData ? ytData.length : 0),
        (ytData && ytData[0] ? ytData[0].channelSubscribers : 0),
        ytLastNDays,
        newYtVideosArr,
    );

    // Send Slack Message
    const app = new Slack.App({
        signingSecret: slackSignInSecret,
        token: slackBotToken,
    });

    const chunkSize = 50;
    for (let i = 0; i < slackMessageBlock.length; i += chunkSize) {
        const chunk = slackMessageBlock.slice(i, i + chunkSize);
        await app.client.chat.postMessage({
            token: slackBotToken,
            channel: slackChannel,
            text: 'Competitor Activity Monitoring Report',
            blocks: chunk,
        });
    }

    log.info('📤 Competitor activity report sent to Slack.');
}
