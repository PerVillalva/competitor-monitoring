function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function formatUrlPart(part) {
    return part.split('-').map(capitalizeFirstLetter).join(' ');
}

function classifyUrl(url, blogUrlPattern) {
    const parts = url.split('/');
    const cleanParts = parts.slice(3).filter((part) => part !== '');
    const isBlogUrl = blogUrlPattern.test(url);

    let categoryPart;
    let titlePart;

    if (isBlogUrl) {
        // For blog URLs, the category is in the 2nd URL depth
        [categoryPart, titlePart] = cleanParts;
    } else {
        // For other URLs, the category is in the 1st URL depth
        [categoryPart, titlePart] = cleanParts;
    }

    const category = categoryPart ? formatUrlPart(categoryPart) : '';
    const title = titlePart ? formatUrlPart(titlePart) : '';

    return {
        isBlogUrl,
        url,
        category,
        title,
    };
}

export function filterBlogURLs(urlArray) {
    // Regular expression pattern to match common blog URL structures
    const blogUrlPattern = /\/(blog|blogs|articles)|\.blog\./i;

    const blogPages = [];
    const productPages = [];

    urlArray.forEach((url) => {
        const { isBlogUrl, category, title } = classifyUrl(url, blogUrlPattern);

        const page = { url, category, title };

        if (isBlogUrl) {
            blogPages.push(page);
        } else {
            productPages.push(page);
        }
    });

    return {
        productPages,
        blogPages,
    };
}
