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
        transformation: [{ width: 1920, crop: "limit" }] // Limit max width
    },
});

const originalStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'insurance-app/posters/original',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'avif'],
    },
});

const croppedStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'insurance-app/posters/cropped',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'avif'],
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
