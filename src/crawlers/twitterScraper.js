import { Actor, log } from 'apify';
import axios from 'axios';

const { APIFY_TOKEN } = process.env;

function filterTweets(tweets, term, lastNDays) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - lastNDays);

    return tweets.filter((tweet) => {
        const tweetDate = new Date(tweet.timestamp);
        const isRecent = tweetDate >= cutoffDate;
        const containsTerm = term ? tweet.text.toLowerCase().includes(term) : true;
        return isRecent && containsTerm;
    });
}

async function fetchDataFromApify(datasetId) {
    const url = `https://api.apify.com/v2/datasets/${datasetId}/items/?token=${APIFY_TOKEN}`;
    try {
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        log.error('Failed to fetch data from Apify:', error);
        throw error;
    }
}

export async function fetchTwitterData(twitterProfile, twitterFilterTerm, twitterLastNDays) {
    log.info('🐦 Gathering Twitter Data...');
    try {
        const twitterActor = await Actor.call('shanes/tweet-flash', {
            from_user: [twitterProfile],
            max_tweets: 50,
        });

        const twitterTaskId = twitterActor.defaultDatasetId;
        const tweets = await fetchDataFromApify(twitterTaskId);

        const filteredTweets = filterTweets(tweets, twitterFilterTerm, twitterLastNDays);

        log.info('✅ Twitter data was successfully extracted.');
        return filteredTweets.map((tweet) => ({
            tweetAuthor: tweet.username,
            tweetUrl: tweet.url,
            tweetText: tweet.text,
            tweetDate: tweet.timestamp.split(' ')[0],
        }));
    } catch (error) {
        log.error('Failed to fetch Twitter data:', error);
        throw error;
    }
}
