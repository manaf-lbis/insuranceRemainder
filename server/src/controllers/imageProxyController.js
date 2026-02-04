const https = require('https');
const http = require('http');

/**
 * @desc    Proxy image requests to hide direct Cloudinary URLs
 * @route   GET /api/images/proxy?url=<encoded_url>
 * @access  Public
 */
const proxyImage = async (req, res) => {
    try {
        const imageUrl = req.query.url;

        if (!imageUrl) {
            return res.status(400).json({ message: 'Image URL is required' });
        }

        // Validate that the URL is from Cloudinary (security check)
        if (!imageUrl.includes('cloudinary.com')) {
            return res.status(403).json({ message: 'Only Cloudinary URLs are allowed' });
        }

        // Determine protocol
        const protocol = imageUrl.startsWith('https') ? https : http;

        // Fetch the image from Cloudinary
        protocol.get(imageUrl, (imageResponse) => {
            // Check if the response is successful
            if (imageResponse.statusCode !== 200) {
                return res.status(imageResponse.statusCode).json({
                    message: 'Failed to fetch image'
                });
            }

            // Set appropriate headers
            res.setHeader('Content-Type', imageResponse.headers['content-type']);
            res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year

            // Stream the image to the client
            imageResponse.pipe(res);
        }).on('error', (error) => {
            console.error('Error fetching image:', error);
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
