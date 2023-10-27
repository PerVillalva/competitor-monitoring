import { Actor } from 'apify';
import axios from 'axios';

const { APIFY_TOKEN } = process.env;

function filterTweets(tweets, term) {
    // Get the current date and time
    const currentDate = new Date();

    return tweets.filter((tweet) => {
        // Convert the tweet's timestamp to a JavaScript Date object
        const tweetDate = new Date(tweet.timestamp);

        // Calculate the difference in days between the current date and the tweet's timestamp
        const dayDifference = (currentDate - tweetDate) / (1000 * 60 * 60 * 24); // Convert milliseconds to days

        // Check if the tweet contains the word "scrapingbee"
        if (term !== undefined) {
            const containsTerm = tweet.text.toLowerCase().includes(term);
            return dayDifference <= 7 && containsTerm;
        }
        return dayDifference;

        // Return true if the tweet is at most 7 days old and contains the word "scrapingbee"
    });
}

export async function fetchTwitterData(twitterProfile, twitterFilterTerm) {
    console.log('🐦 Gathering Twitter Data...');
    const twitterActor = await Actor.call('shanes/tweet-flash', {
        from_user: [twitterProfile],
        max_tweets: 50,
    });

    const twitterTaskId = twitterActor.defaultDatasetId;

    const twitterRunDataset = axios.get(
        `https://api.apify.com/v2/datasets/${twitterTaskId}/items/?token=${APIFY_TOKEN}`,
    );

    const filteredTweets = filterTweets(
        (await twitterRunDataset).data,
        twitterFilterTerm,
    );

    console.log('✅ Twitter data was successfully extracted.');
    return filteredTweets.map((tweet) => ({
        tweetUrl: tweet.url,
        tweetText: tweet.text,
        tweetDate: tweet.timestamp.split(' ')[0],
    }));
}
