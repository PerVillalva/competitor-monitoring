import { Actor, log } from 'apify';
import axios from 'axios';

const { APIFY_TOKEN } = process.env;

export async function fetchYoutubeData(channelUrl, nDays, ytMaxResults) {
    log.info('📽️ Gathering Youtube Data...');
    const youtubeActor = await Actor.call('streamers/youtube-scraper', {
        maxResults: ytMaxResults,
        scrapeLastNDays: nDays,
        startUrls: channelUrl,
        sortVideosBy: 'NEWEST',
        maxResultStreams: 0,
        maxResultsShorts: 0,
    });

    const youtubeTaskId = youtubeActor.defaultDatasetId;

    const youtubeRunDataset = axios.get(
        `https://api.apify.com/v2/datasets/${youtubeTaskId}/items/?token=${APIFY_TOKEN}`,
    );

    const youtubeData = (await youtubeRunDataset).data;

    log.info('✅ Youtube data was successfully extracted.');
    return youtubeData.map((yt) => ({
        channelName: yt.channelName,
        channelSubscribers: yt.numberOfSubscribers,
        videoDate: yt.date.split('T')[0],
        videoViewCount: yt.viewCount,
        videoUrl: yt.url,
        videoTitle: yt.title,
    }));
}
