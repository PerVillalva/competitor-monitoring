import { Actor, log } from 'apify';
import axios from 'axios';

const { APIFY_TOKEN } = process.env;

// Util Functions
export function parseDate(inputDate) {
    const parsedDate = new Date(inputDate);

    // Get the day, month, year, hour, and minutes components
    const day = parsedDate.getDate();
    const month = parsedDate.toLocaleString('default', { month: 'short' });
    const year = parsedDate.getFullYear();
    const hours = parsedDate.getHours();
    const minutes = parsedDate.getMinutes();

    // Determine whether it's AM or PM
    const period = hours >= 12 ? 'PM' : 'AM';

    // Convert hours to 12-hour format
    const hour12 = hours % 12 || 12; // Handle midnight (0) as 12

    // Get the timezone abbreviation and offset
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    // Format the minutes with leading zeros
    const formattedMinutes = minutes.toString().padStart(2, '0');

    // Construct the readable date string
    const readableDate = `${day} ${month} ${year}, ${hour12}:${formattedMinutes} ${period} ${timezone}`;

    return readableDate;
}

// Twitter Functions

function filterTweets(tweets, term, lastNDays) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - lastNDays);

    return tweets.filter((tweet) => {
        const tweetDate = new Date(tweet.createdAt);
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
        const twitterActor = await Actor.call('apidojo/tweet-scraper', {
            searchTerms: [twitterFilterTerm],
            maxItems: 10,
            sort: 'Latest',
        });

        const twitterTaskId = twitterActor.defaultDatasetId;
        const tweets = await fetchDataFromApify(twitterTaskId);

        const filteredTweets = filterTweets(tweets, twitterFilterTerm, twitterLastNDays);

        log.info('✅ Twitter data was successfully extracted.');
        return filteredTweets.map((tweet) => ({
            tweetAuthor: tweet.author.userName,
            tweetAvatar: tweet.author.profilePicture,
            authorFollowers: tweet.author.followers,
            tweetUrl: tweet.url,
            tweetText: tweet.text,
            tweetDate: parseDate(tweet.createdAt),
            tweetLikes: tweet.likeCount,
            tweetRetweets: tweet.retweetCount,
            tweetReplies: tweet.replyCount,
            inReplyTo: tweet.isReply ? tweet.inReplyToUsername : '',
        }));
    } catch (error) {
        log.error('Failed to fetch Twitter data:', error);
        throw error;
    }
}
