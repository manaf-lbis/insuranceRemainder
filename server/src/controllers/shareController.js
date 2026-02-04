const announcementService = require('../services/announcementService');

/**
 * Extracts the URL of the first <img> tag from an HTML string.
 * This is a duplicated utility because we can't easily import from client src in node.
 */
const extractFirstImage = (htmlString) => {
    if (!htmlString) return null;
    const imgRegex = /<img[^>]+src="([^">]+)"/i;
    const match = htmlString.match(imgRegex);
    return match ? match[1] : null;
};

/**
 * @desc    Get announcement share preview
 * @route   GET /api/announcements/share/:id
 * @access  Public
 */
const getAnnouncementSharePreview = async (req, res) => {
    try {
        const announcement = await announcementService.getAnnouncementById(req.params.id);
        const firstImage = extractFirstImage(announcement.content);
        const targetUrl = process.env.FRONTEND_URL ? `${process.env.FRONTEND_URL}/announcements/${announcement._id}` : `https://insurance-remainder.vercel.app/announcements/${announcement._id}`;

        // Use backend proxy URL for the image
        // This ensures social media crawlers see a backend URL, not the direct Cloudinary URL
        const apiUrl = process.env.API_URL || 'https://api.notifycsc.com'; // Fallback or env
        // Construct the proxy URL
        const proxyUrl = firstImage ? `${apiUrl}/api/images/proxy?url=${encodeURIComponent(firstImage)}` : 'https://insurance-remainder.vercel.app/pwa-192x192.png';

        const title = announcement.title;
        const description = `Check out this update from Notify CSC: ${title}`;

        // Default image if none found in content - use a placeholder or app logo
        // Ideally this should be a real URL.
        const imageUrl = firstImage || 'https://insurance-remainder.vercel.app/pwa-192x192.png';

        const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} | Notify CSC</title>
    
    <!-- Open Graph / Facebook / WhatsApp -->
    <meta property="og:type" content="article">
    <meta property="og:url" content="${targetUrl}">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${description}">
    <meta property="og:image" content="${proxyUrl}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:url" content="${targetUrl}">
    <meta name="twitter:title" content="${title}">
    <meta name="twitter:description" content="${description}">
    <meta name="twitter:image" content="${proxyUrl}">

    <!-- Redirect for real users -->
    <script>
        window.location.href = "${targetUrl}";
    </script>
</head>
<body>
    <p>Redirecting to article...</p>
</body>
</html>
        `;

        res.send(html);

    } catch (error) {
        console.error('Error generating share preview:', error);
        res.status(404).send('Announcement not found');
    }
};

module.exports = {
    getAnnouncementSharePreview
};
