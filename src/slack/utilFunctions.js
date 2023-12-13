export function filterBlogURLs(urlArray) {
    // Regular expression pattern to match common blog URL structures
    const blogUrlPattern = /\/(blog|blogs|articles)|\.blog\./i;

    // Initialize arrays for blog URLs, blog-related URLs, and non-blog-related URLs
    const blogURLs = [];
    const remainingURLs = [];

    // Iterate through the URLs and classify them
    urlArray.forEach((url) => {
        if (blogUrlPattern.test(url)) {
            blogURLs.push(url);
        } else {
            remainingURLs.push(url);
        }
    });

    return { blogURLs, remainingURLs };
}
