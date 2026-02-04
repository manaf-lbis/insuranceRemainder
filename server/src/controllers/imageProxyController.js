const https = require('https');
const http = require('http');

/**
 * @desc    Proxy image requests to hide direct Cloudinary URLs
 * @route   GET /api/images/proxy?url=<encoded_url>
 * @access  Public
 */
const proxyImage = async (req, res) => {
    try {
        let imageUrl = req.query.url;

        console.log(`[Proxy Request] Raw URL: ${imageUrl}`);

        if (!imageUrl) {
            return res.status(400).json({ message: 'Image URL is required' });
        }

        // Handle potential double encoding or weird query parsing
        if (imageUrl.startsWith('http%3A') || imageUrl.startsWith('https%3A')) {
            try {
                imageUrl = decodeURIComponent(imageUrl);
                console.log(`[Proxy Request] Decoded URL: ${imageUrl}`);
            } catch (e) {
                console.error('[Proxy Request] Failed to decode URL:', e);
            }
        }

        // Validate that the URL is from Cloudinary (security check)
        if (!imageUrl.includes('cloudinary.com')) {
            console.warn(`[Proxy Request] Rejected non-Cloudinary URL: ${imageUrl}`);
            return res.status(403).json({ message: 'Only Cloudinary URLs are allowed' });
        }

        // Determine protocol
        const protocol = imageUrl.startsWith('https') ? https : http;

        // Fetch the image from Cloudinary
        protocol.get(imageUrl, (imageResponse) => {
            // Check if the response is specific success codes (200)
            if (imageResponse.statusCode !== 200) {
                console.error(`[Proxy Request] Upstream Error ${imageResponse.statusCode} for ${imageUrl}`);
                return res.status(imageResponse.statusCode).json({
                    message: 'Failed to fetch image from upstream'
                });
            }

            // Set appropriate headers
            const contentType = imageResponse.headers['content-type'];
            if (contentType) res.setHeader('Content-Type', contentType);

            res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
            res.setHeader('Access-Control-Allow-Origin', '*'); // Allow usage in canvas/social

            // Stream the image to the client
            imageResponse.pipe(res);
        }).on('error', (error) => {
            console.error('[Proxy Request] Stream Error:', error);
            res.status(500).json({ message: 'Failed to proxy image' });
        });

    } catch (error) {
        console.error('Error in image proxy:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    proxyImage
};
