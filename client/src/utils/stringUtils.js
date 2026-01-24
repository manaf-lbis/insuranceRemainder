/**
 * Extracts the URL of the first <img> tag from an HTML string.
 * @param {string} htmlString - The HTML content to parse.
 * @returns {string|null} - The source URL of the first image found, or null if none.
 */
export const extractFirstImage = (htmlString) => {
    if (!htmlString) return null;

    const imgRegex = /<img[^>]+src="([^">]+)"/i;
    const match = htmlString.match(imgRegex);

    return match ? match[1] : null;
};
