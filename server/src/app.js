const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const { errorHandler } = require('./middleware/errorMiddleware');

const app = express();

// CORS Configuration
const corsOptions = {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware
app.use(express.json());
app.use(cors(corsOptions));

// Configure Helmet with a more flexible CSP for SPAs
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            ...helmet.contentSecurityPolicy.getDefaultDirectives(),
            "script-src": ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
            "img-src": ["'self'", "data:", "https:", "http:"],
            "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            "font-src": ["'self'", "https://fonts.gstatic.com"],
            "connect-src": ["'self'", "https:", "http:"],
        },
    },
    crossOriginEmbedderPolicy: false,
}));

app.use(morgan('dev'));

// Static files (must be before API routes or after, but carefully ordered)
const publicPath = path.join(__dirname, '../../client/dist');
app.use(express.static(publicPath));

// Routes
app.use('/api/public', require('./routes/publicRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/insurances', require('./routes/insuranceRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));

app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/posters', require('./routes/posterRoutes'));
app.use('/api/announcements', require('./routes/announcementRoutes'));
app.use('/api/news-categories', require('./routes/newsCategoryRoutes')); // New Route
app.use('/api/notifications', require('./routes/notificationRoutes')); // Notification routes
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/images', require('./routes/imageProxyRoutes')); // Image Proxy Route


const fs = require('fs');

// Server-Side Injection for Announcement SEO & Social Sharing
app.get('/announcements/:id', async (req, res, next) => {
    try {
        // Only handle this for browser/bot requests, not API calls (though path prevents API collision)
        // logic: fetch data -> read index.html -> inject meta -> send

        const announcementService = require('./services/announcementService');
        const announcement = await announcementService.getAnnouncementById(req.params.id);

        if (!announcement) return next(); // Fallback to normal SPA handling if not found

        // Fetch the frontend's index.html (Remote Fetch Strategy)
        // This decouples backend from having client build files locally
        const clientUrl = process.env.CLIENT_URL || 'https://notifycsc.vercel.app';
        let htmlData = '';

        try {
            const response = await fetch(`${clientUrl}/index.html`);
            if (!response.ok) {
                console.error(`Failed to fetch index.html from ${clientUrl}`);
                return next();
            }
            htmlData = await response.text();
        } catch (fetchErr) {
            console.error('Error fetching remote index.html:', fetchErr);
            // Fallback: try local file if available
            try {
                htmlData = fs.readFileSync(path.join(publicPath, 'index.html'), 'utf8');
            } catch (fsErr) {
                // CRITICAL: URL Fetch Failed & Local File Missing (Render env)
                // DO NOT Redirect (causes infinite loop with Vercel)
                // Serve a minimal Fallback HTML with Meta Tags so scraping still works
                console.warn('[Meta Inject] Serving Fallback HTML (Fetch Failed)');
                htmlData = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Notify CSC</title>
    <!-- Placeholder for injection -->
    </head>
  <body>
    <div id="root"></div>
    <script>
      // Client-side Fallback: Redirect to Frontend if this is a human
      window.location.href = "${clientUrl}/announcements/${req.params.id}";
    </script>
  </body>
</html>`;
            }
        }

        // Extract image with robust regex (handles single and double quotes)
        const imgRegex = /<img[^>]+src=["']([^"']+)["']/i;
        const match = announcement.content.match(imgRegex);
        const firstImage = match ? match[1] : null;

        if (!firstImage) {
            console.log(`[Meta Inject] ID: ${req.params.id} | No image found in content.`);
        }

        // Dynamic API URL Strategy:
        // 1. Try env var API_URL
        // 2. Try hardcoded fallback (Updated to actual Render URL)
        // 3. Fallback to current request's host (Best query-proof method for self-hosted)
        let apiUrl = process.env.API_URL || 'https://insuranceremainder.onrender.com';
        if (!process.env.API_URL) {
            // We keep the hardcoded fallback as primary if API_URL is missing,
            // OR we can trust the host. 
            // Since user confirmed the URL, let's prioritize it as default.
        }

        // Generate simple description
        const cleanDesc = announcement.content.replace(/<[^>]*>/g, '').substring(0, 150) + '...';

        // Proxy URL Strategy (Masking Backend)
        const frontendProxyPath = '/p-image';

        // Ensure clientUrl does not end with slash
        const baseUrl = clientUrl.replace(/\/$/, '');

        // Optimize Cloudinary Image for Social Media (Full Image via Padding)
        // Use c_pad + b_white to fit the WHOLE image into the 1200x630 box without cropping.
        // GREEDY REGEX: Matches /upload/ followed by ANYTHING until /v<digits>/
        let finalImageUrl = firstImage;
        if (firstImage && firstImage.includes('cloudinary.com') && firstImage.includes('/upload/')) {
            // Check if there is a version segment like /v123456/
            // We use .*? to be lazy, but we want to consume all transform segments.
            // Actually, standard Cloudinary is /upload/TRANSFORMS/vVERSION/FILE
            // So matching /upload/(.*)/v(\d+)/ allows us to replace $1 with our new transforms.

            const versionMatch = firstImage.match(/\/upload\/(.*)\/v(\d+)\//);

            if (versionMatch) {
                // versionMatch[1] is the existing transforms (e.g. 'c_fill,w_300/e_art')
                // versionMatch[2] is '12345' (the version number)

                // We replace the match with: /upload/OUR_PARAMS/vVERSION/
                finalImageUrl = firstImage.replace(/\/upload\/.*\/v\d+\//, `/upload/w_1200,h_630,c_pad,b_white,q_50,f_jpg/v${versionMatch[2]}/`);
            } else {
                // Fallback: If no version found (unlikely), append after upload/
                finalImageUrl = firstImage.replace('/upload/', '/upload/w_1200,h_630,c_pad,b_white,q_50,f_jpg/');
            }
        }

        // Construct clean Frontend Image URL
        // Append a random version to force WhatsApp to re-crawl (Bust Cache)
        const version = Date.now();
        const proxyUrl = firstImage
            ? `${baseUrl}${frontendProxyPath}?url=${encodeURIComponent(finalImageUrl)}&v=${version}`
            : `${baseUrl}/pwa-192x192.png`;

        console.log(`[Meta Inject] ID: ${req.params.id} | ProxyImg: ${proxyUrl}`);

        // Inject Meta Tags
        // Title: RESTORED (User wants specific title like "Ration Card...")
        // Description: HIDDEN (" ")
        let modifiedHtml = htmlData
            .replace('<title>Notify CSC</title>', `<title>${announcement.title} | Notify CSC</title>`)
            .replace('</head>', `
                <meta property="og:title" content="${announcement.title}" />
                <meta property="og:description" content=" " />
                <meta property="og:image" content="${proxyUrl}" />
                <meta property="og:type" content="article" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="${announcement.title}" />
                <meta name="twitter:description" content=" " />
                <meta name="twitter:image" content="${proxyUrl}" />
                </head>
            `);

        res.send(modifiedHtml);

    } catch (error) {
        console.error('Error injecting meta tags:', error);
        next(); // Fallback to normal SPA serving
    }
});

// Serve frontend in production (catch-all for other routes)
if (process.env.NODE_ENV === 'production') {
    // Handle SPA routing: serve index.html for any non-API route
    app.get(/(.*)/, (req, res) => {
        if (!req.path.startsWith('/api')) {
            // If we are here, it means the specific /announcements/:id handler didn't catch it
            // OR it isn't an announcement route.
            // We still want to serve index.html for SPA (unless we want to remote fetch for everything?)
            // For simplicity, we fall back to local file IF available, or just Remote Fetch again if needed.
            // But usually this block assumes we Have the files.
            // Wait, if Render DOES NOT have files, fs.sendFile fails!
            // So we should strictly redirect or fetch remote?
            // Since we established Render doesn't have the build, we should perform the Remote Fetch Strategy for ALL routes?
            // OR, just say "Not Found" for API and redirect ROOT to frontend?

            // If we are strictly a backend API, we shouldn't fail on index.html missing if we don't expect to serve it.
            // BUT user wants to serve frontend via backend? No, Backend is just API.
            // So this block is legacy "Monolith" thinking.
            // However, for clean fallbacks, we might want to Redirect to Client URL?

            res.redirect(process.env.CLIENT_URL || 'https://notifycsc.vercel.app');
        } else {
            res.status(404).json({ message: 'API Route not found' });
        }
    });
} else {
    app.get('/', (req, res) => {
        res.send('API is running in development mode...');
    });
}

// Error Middleware
app.use(errorHandler);

module.exports = app;
