// eslint-disable-next-line import/no-extraneous-dependencies
import Slack from '@slack/bolt';
import { log } from 'apify';

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

    const competitorNameRaw = new URL(initialUrl[0].url).hostname.split('.')[1];
    const competitorNameClean = competitorNameRaw.charAt(0).toUpperCase() + competitorNameRaw.slice(1);

    // Prepare Tweets
    let tweetsString;
    if (Array.isArray(newTweets) && newTweets.length > 0) {
        tweetsString = `There are ${newTweets.length} new tweets.`;
        newTweets.forEach((tweet, index) => {
            tweetsString += `${separator}\nTweet ${index + 1}:\nUrl: ${
                tweet.tweetUrl
            }\nText: ${tweet.tweetText}\nDate: ${tweet.tweetDate}`;
        });
    } else {
        tweetsString = `No new Tweets.`;
    }

    // Prepare New Pages
    const pagesString = `:page_facing_up: ${
        newUrls.length
    } new pages were created: \n${newUrls.join('\n')}`;

    const updatesString = `:arrows_counterclockwise: ${
        pageUpdates.length
    } pages were updated: \n${pageUpdates
        .map(
            (update) => `${separator}\nUpdated page URL: ${update.url}\nUpdated on: ${update.lastMod}`,
        )
        .join('\n')}`;

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
