const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'insurance-app/posters',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'avif'],
        transformation: [
            { width: 1920, crop: "limit" },
            // Vertical watermark on left side (solid)
            {
                overlay: {
                    font_family: "Arial",
                    font_size: 24,
                    font_weight: "bold",
                    text: "NOTIFYCSC_9633565414"
                },
                gravity: "west",
                x: 15,
                angle: 90,
                opacity: 80,
                color: "#FFFFFF"
            },
            // Diagonal watermark across image (light)
            {
                overlay: {
                    font_family: "Arial",
                    font_size: 32,
                    text: "NOTIFYCSC_9633565414"
                },
                gravity: "center",
                angle: -35,
                opacity: 25,
                color: "#FFFFFF"
            }
        ]
    },
});

const originalStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'insurance-app/posters/original',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'avif'],
        transformation: [
            // Vertical watermark on left side (solid)
            {
                overlay: {
                    font_family: "Arial",
                    font_size: 14,
                    font_weight: "bold",
                    text: "NOTIFYCSC_9633565414"
                },
                gravity: "west",
                x: 10,
                angle: 90,
                opacity: 75,
                color: "#FFFFFF"
            },
            // Diagonal watermark across image (light)
            {
                overlay: {
                    font_family: "Arial",
                    font_size: 18,
                    text: "NOTIFYCSC_9633565414"
                },
                gravity: "center",
                angle: -35,
                opacity: 15,
                color: "#FFFFFF"
            }
        ]
    },
});

const croppedStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'insurance-app/posters/cropped',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'avif'],
        transformation: [
            // Vertical watermark on left side (solid)
            {
                overlay: {
                    font_family: "Arial",
                    font_size: 14,
                    font_weight: "bold",
                    text: "NOTIFYCSC_9633565414"
                },
                gravity: "west",
                x: 10,
                angle: 90,
                opacity: 75,
                color: "#FFFFFF"
            },
            // Diagonal watermark across image (light)
            {
                overlay: {
                    font_family: "Arial",
                    font_size: 18,
                    text: "NOTIFYCSC_9633565414"
                },
                gravity: "center",
                angle: -35,
                opacity: 15,
                color: "#FFFFFF"
            }
        ]
    },
});

const upload = multer({ storage: storage });
const uploadOriginal = multer({ storage: originalStorage });
const uploadCropped = multer({ storage: croppedStorage });

module.exports = {
    cloudinary,
    upload,
    uploadOriginal,
    uploadCropped
};
