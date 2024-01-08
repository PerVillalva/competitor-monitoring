// Twitter
export function generateTwitterBlock(
    tweetAuthor,
    tweetDate,
    tweetLikes,
    tweetReplies,
    tweetRetweets,
    inReplyTo,
    tweetText,
    tweetURL,
    tweetAvatarImg,
) {
    const tweetBlock = [
        {
            type: 'section',
            text: {
                type: 'mrkdwn',
                text: `*Author*\n*${tweetAuthor}*\n\n*Date*\n*${tweetDate}*\n`,
            },
            accessory: {
                type: 'image',
                image_url: `${tweetAvatarImg}`,
                alt_text: 'author_avatar',
            },
        },
        {
            type: 'context',
            elements: [
                {
                    type: 'mrkdwn',
                    text: `:thumbsup: *Likes: \`${tweetLikes}\`*`,
                },
                {
                    type: 'mrkdwn',
                    text: `*:speech_balloon: Replies: \`${tweetReplies}\`*`,
                },
                {
                    type: 'mrkdwn',
                    text: `*:repeat: Retweets: \`${tweetRetweets}\`*`,
                },
                ...(inReplyTo.length > 0
                    ? [
                        {
                            type: 'mrkdwn',
                            text: `*:leftwards_arrow_with_hook: In reply to ${inReplyTo[0]}*`,
                        },
                    ]
                    : []),
            ],
        },
        {
            type: 'divider',
        },
        {
            type: 'section',
            text: {
                type: 'mrkdwn',
                text: `${tweetText}`,
            },
            accessory: {
                type: 'button',
                text: {
                    type: 'plain_text',
                    text: 'View Tweet',
                    emoji: true,
                },
                style: 'primary',
                value: 'View Tweet',
                url: `${tweetURL}`,
                action_id: 'button-action',
            },
        },
        {
            type: 'divider',
        },
    ];

    return tweetBlock;
}

// YouTube
export function generateYTBlock(
    videoURL,
    videoTitle,
    videoThumbnail,
    videoViews,
    videoLikes,
    videoComments,
    videoDuration,
    publishedDate,
) {
    const ytBlock = [
        {
            type: 'section',
            text: {
                type: 'mrkdwn',
                text: `*<${videoURL}|${videoTitle}>*\n\n*Published Date: ${publishedDate}*\n`,
            },
            accessory: {
                type: 'image',
                image_url: `${videoThumbnail}`,
                alt_text: 'author_avatar',
            },
        },
        {
            type: 'context',
            elements: [
                {
                    type: 'mrkdwn',
                    text: `:eyes: *Views: \`${videoViews}\`*`,
                },
                {
                    type: 'mrkdwn',
                    text: `*:thumbsup: Likes: \`${videoLikes}\`*`,
                },
                {
                    type: 'mrkdwn',
                    text: `*:speech_balloon: Comments: \`${videoComments}\`*`,
                },
                {
                    type: 'mrkdwn',
                    text: `*:stopwatch: Duration: \`${videoDuration}\`*`,
                },
            ],
        },
        {
            type: 'divider',
        },
    ];

    return ytBlock;
}

// New Product Pages
export function generateNewProductBlock(
    newProdPageURL,
) {
    return {
        type: 'section',
        text: {
            type: 'mrkdwn',
            text: `• ${newProdPageURL}\n`,
        },
    };
}

// New Blog Pages
export function generateNewBlogBlock(
    newBlogPageURL,
) {
    return {
        type: 'section',
        text: {
            type: 'mrkdwn',
            text: `• ${newBlogPageURL}\n`,
        },
    };
}

// Updated Product Pages
export function generateUpdatedProductBlock(
    updatedProdPageURL,
) {
    return {
        type: 'section',
        text: {
            type: 'mrkdwn',
            text: `• ${updatedProdPageURL}\n`,
        },
    };
}

// Updated Blogs
export function generateUpdatedBlogBlock(
    updatedBlogPageURL,
) {
    return {
        type: 'section',
        text: {
            type: 'mrkdwn',
            text: `• ${updatedBlogPageURL}\n`,
        },
    };
}

// Master Block
export function generateBlock(
    competitorName,
    newPagesCount,
    newBlogPages,
    newProductPages,
    updatedPagesCount,
    updatedBlogPages,
    updatedProductPages,
    twitterProfile,
    newTweetsCount,
    newTweets,
    newVideosCount,
    channelSubsCount,
    ytLastNDays,
    newVideos,
) {
    const slackBlock = [
        {
            type: 'header',
            text: {
                type: 'plain_text',
                text: `:bar_chart: Report for ${competitorName}`,
            },
        },
        {
            type: 'divider',
        },
        {
            type: 'header',
            text: {
                type: 'plain_text',
                text: `🆕 ${newPagesCount} page(s) were created`,
                emoji: true,
            },
        },
        {
            type: 'section',
            text: {
                type: 'mrkdwn',
                text: `:memo: *New blog pages: \`${newBlogPages.length}\`*\n\n`,
            },
        },
        ...(newBlogPages.length > 0 ? newBlogPages : []),
        {
            type: 'section',
            text: {
                type: 'mrkdwn',
                text: `:bulb: *New product pages: \`${newProductPages.length}\`*\n\n`,
            },
        },
        ...(newProductPages.length > 0 ? newProductPages : []),
        {
            type: 'divider',
        },
        {
            type: 'divider',
        },
        {
            type: 'header',
            text: {
                type: 'plain_text',
                text: `:arrows_counterclockwise: ${updatedPagesCount} page(s) were updated`,
                emoji: true,
            },
        },
        {
            type: 'section',
            text: {
                type: 'mrkdwn',
                text: `:memo: *Updated blog pages: \`${updatedBlogPages.length}\`*\n\n`,
            },
        },
        ...(updatedBlogPages.length > 0 ? updatedBlogPages : []),
        {
            type: 'section',
            text: {
                type: 'mrkdwn',
                text: `:bulb: *Updated product pages: \`${updatedProductPages.length}\`*\n\n`,
            },
        },
        ...(updatedProductPages.length > 0 ? updatedProductPages : []),
        {
            type: 'divider',
        },
        {
            type: 'divider',
        },
        {
            type: 'header',
            text: {
                type: 'plain_text',
                text: `🐦 ${competitorName}'s Twitter Activity`,
                emoji: true,
            },
        },
        {
            type: 'section',
            text: {
                type: 'mrkdwn',
                text: twitterProfile !== undefined
                    ? `*💬 New Tweets from ${twitterProfile}: \`${newTweetsCount}\`*\n\n`
                    : 'No Twitter profile provided. Please provide a Twitter profile to monitor.',
            },
        },
        ...(newTweets.length > 0 ? newTweets : []),
        {
            type: 'divider',
        },
        {
            type: 'header',
            text: {
                type: 'plain_text',
                text: `📺 ${competitorName}'s YouTube Activity`,
                emoji: true,
            },
        },
        {
            type: 'section',
            text: {
                type: 'mrkdwn',
                text: ytLastNDays !== undefined
                    ? `*📹 Videos posted in the last ${ytLastNDays} days: \`${newVideosCount}\`*\n\n${
                        newVideosCount >= 1 ? `*🎬 Current Channel Subscribers: \`${channelSubsCount}\`*` : ''}`
                    : 'No YouTube Channel provided. Please provide a YouTube channel to monitor.',
            },
        },
        {
            type: 'divider',
        },
        ...(newVideos.length > 0 ? newVideos : []),
    ];
    return slackBlock;
}
