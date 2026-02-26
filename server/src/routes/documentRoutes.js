const express = require('express');
const router = express.Router();
const {
    uploadDocument,
    getDocuments,
    deleteDocument,
    updateDocumentStatus,
    incrementDownload,
    getDocumentStats,
    getTopContributors,
    viewDocument,
    checkSimilarity
} = require('../controllers/documentController');
const { protect, admin } = require('../middleware/authMiddleware');
const { cloudinary } = require('../config/cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Cloudinary storage for Documents (Auto resource type with preserved extensions)
const pdfStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'insurance-app/documents',
        resource_type: 'raw', // Using 'raw' is more reliable for PDFs and Word docs
        public_id: (req, file) => {
            const originalName = file.originalname || 'document';
            const nameWithoutExt = originalName.split('.').slice(0, -1).join('.').replace(/[^a-zA-Z0-9]/g, '_');
            return `${nameWithoutExt}_${Date.now()}`;
        },
    },
});

const uploadPdf = multer({
    storage: pdfStorage,
    limits: { fileSize: 3 * 1024 * 1024 }, // 3 MB max
    fileFilter: (req, file, cb) => {
        const allowedMimeTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'image/jpeg',
            'image/png',
            'image/webp'
        ];
        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only PDF, Word, and Images (JPG/PNG/WEBP) are allowed'), false);
        }
    },
});

// Middleware: only vle, akshaya, admin allowed
const vleOrAdmin = (req, res, next) => {
    if (['vle', 'akshaya', 'admin'].includes(req.user?.role)) {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized' });
    }
};

router.get('/stats', protect, vleOrAdmin, getDocumentStats);
router.get('/top-contributors', protect, getTopContributors);
router.post('/upload', protect, vleOrAdmin, uploadPdf.single('file'), uploadDocument);
router.get('/', protect, vleOrAdmin, getDocuments);
router.post('/check-similarity', protect, checkSimilarity);
router.delete('/:id', protect, vleOrAdmin, deleteDocument);
router.put('/:id/status', protect, admin, updateDocumentStatus);
router.post('/:id/download', protect, incrementDownload);
router.get('/:id/view', protect, viewDocument);

module.exports = router;
