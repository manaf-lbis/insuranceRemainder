const Document = require('../models/Document');
const Category = require('../models/Category');
const { cloudinary } = require('../config/cloudinary');
const https = require('https');
const { sendDocumentStatusEmail } = require('../services/emailService');

// @desc    Upload a PDF document
// @route   POST /api/documents/upload
// @access  Private (vle/akshaya)
const uploadDocument = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const { title, description, category, termsAccepted } = req.body;
        if (!title || !category) {
            return res.status(400).json({ message: 'Title, and Category are required' });
        }

        // Basic Sanitize - remove HTML tags
        const cleanTitle = title.replace(/<[^>]*>?/gm, '').trim();
        const cleanDesc = (description || '').replace(/<[^>]*>?/gm, '').trim();

        const doc = await Document.create({
            title: cleanTitle,
            description: cleanDesc,
            category,
            fileUrl: req.file.path,
            filePublicId: req.file.filename,
            fileName: req.file.originalname,
            fileSize: req.file.size,
            fileType: req.file.mimetype,
            fileResourceType: req.file.resource_type || 'image',
            uploadedBy: req.user._id,
            status: 'pending', // Always start as pending
            termsAccepted: termsAccepted === 'true' || termsAccepted === true,
        });

        res.status(201).json(doc);
    } catch (error) {
        console.error('Upload document error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all documents for logged-in user
// @route   GET /api/documents
// @access  Private (vle/akshaya)
const getDocuments = async (req, res) => {
    try {
        const { status, category, search } = req.query;
        let filter = {};

        // Role-based visibility:
        // Admin/Staff see everything by default
        // VLE/Akshaya see all APPROVED files OR their own files regardless of status
        if (!['admin', 'staff'].includes(req.user.role)) {
            filter = {
                $or: [
                    { status: 'approved' },
                    { uploadedBy: req.user._id }
                ]
            };
        }

        if (status) filter.status = status;
        if (category) filter.category = category;
        if (search) {
            // First find any categories that match the search term
            const matchingCategories = await Category.find({
                name: { $regex: search, $options: 'i' }
            }).select('_id');
            const catIds = matchingCategories.map(c => c._id);

            filter.$and = filter.$and || [];
            filter.$and.push({
                $or: [
                    { title: { $regex: search, $options: 'i' } },
                    { description: { $regex: search, $options: 'i' } },
                    { category: { $in: catIds } }
                ]
            });
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const totalDocs = await Document.countDocuments(filter);
        const docs = await Document.find(filter)
            .populate('uploadedBy', 'name username role shopName mobile')
            .populate('category', 'name')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        res.json({
            documents: docs,
            page,
            pages: Math.ceil(totalDocs / limit),
            total: totalDocs
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a document
// @route   DELETE /api/documents/:id
// @access  Private (owner or admin)
const deleteDocument = async (req, res) => {
    try {
        const doc = await Document.findById(req.params.id);

        if (!doc) {
            return res.status(404).json({ message: 'Document not found' });
        }

        // Allow owner or admin
        const isOwner = doc.uploadedBy.toString() === req.user._id.toString();
        const isAdmin = req.user.role === 'admin';
        if (!isOwner && !isAdmin) {
            return res.status(403).json({ message: 'Not authorized to delete this document' });
        }

        // Delete from Cloudinary
        await cloudinary.uploader.destroy(doc.filePublicId, { resource_type: 'raw' });

        await doc.deleteOne();
        res.json({ message: 'Document deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Approve or Reject a document
// @route   PUT /api/documents/:id/status
// @access  Private (Admin)
const updateDocumentStatus = async (req, res) => {
    try {
        const { status, rejectionReason, title, description, category } = req.body;

        const doc = await Document.findById(req.params.id).populate('uploadedBy', 'name email');
        if (!doc) return res.status(404).json({ message: 'Document not found' });

        // If admin provides metadata updates, apply them
        if (title) doc.title = title.replace(/<[^>]*>?/gm, '').trim();
        if (description !== undefined) doc.description = description.replace(/<[^>]*>?/gm, '').trim();
        if (category) doc.category = category;

        if (status) {
            if (!['approved', 'rejected', 'pending'].includes(status)) {
                return res.status(400).json({ message: 'Invalid status' });
            }
            const oldStatus = doc.status;
            doc.status = status;

            if (status === 'rejected') {
                doc.rejectionReason = rejectionReason || 'No reason provided';
            } else if (status === 'approved') {
                doc.rejectionReason = undefined; // Clear reason if re-approved
            }

            // Send Email Notification on status change
            if (status !== oldStatus && (status === 'approved' || status === 'rejected')) {
                try {
                    const uploader = doc.uploadedBy;
                    await sendDocumentStatusEmail(
                        uploader.email,
                        uploader.name,
                        doc.title,
                        status,
                        rejectionReason
                    );
                } catch (err) {
                    console.error('Failed to send status email:', err);
                }
            }
        }

        await doc.save();
        res.json(doc);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Increment download count
// @route   POST /api/documents/:id/download
// @access  Private
const incrementDownload = async (req, res) => {
    try {
        const doc = await Document.findById(req.params.id);
        if (!doc) return res.status(404).json({ message: 'Document not found' });

        doc.downloadCount += 1;
        await doc.save();
        res.json({ downloadCount: doc.downloadCount });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Check for similar documents (duplicate detection)
// @route   POST /api/documents/check-similarity
// @access  Private
const checkSimilarity = async (req, res) => {
    try {
        const { title } = req.body;
        if (!title) return res.status(400).json({ message: 'Title is required' });

        // Simple approach: regex search for similar words
        const words = title.split(/\s+/).filter(w => w.length > 3);
        const regexes = words.map(w => new RegExp(w, 'i'));

        const similarDocs = await Document.find({
            status: 'approved',
            $or: [
                { title: { $regex: title, $options: 'i' } },
                { title: { $in: regexes } }
            ]
        }).limit(5).select('title category').populate('category', 'name');

        res.json(similarDocs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get dashboard stats for operator
// @route   GET /api/documents/stats
// @access  Private
const getDocumentStats = async (req, res) => {
    try {
        const userId = req.user._id;

        const [myTotal, myPending, myApproved, myDownloads] = await Promise.all([
            Document.countDocuments({ uploadedBy: userId }),
            Document.countDocuments({ uploadedBy: userId, status: 'pending' }),
            Document.countDocuments({ uploadedBy: userId, status: 'approved' }),
            Document.aggregate([
                { $match: { uploadedBy: userId } },
                { $group: { _id: null, total: { $sum: "$downloadCount" } } }
            ]).then(res => res[0]?.total || 0)
        ]);

        const totalPendingApproval = await Document.countDocuments({ status: 'pending' });

        res.json({
            myContributions: myTotal,
            myPending,
            myApproved,
            myDownloads,
            totalPendingApproval // For all operators to see how many are in queue
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get top contributors
// @route   GET /api/documents/top-contributors
// @access  Private
const getTopContributors = async (req, res) => {
    try {
        const tops = await Document.aggregate([
            { $match: { status: 'approved' } },
            {
                $group: {
                    _id: "$uploadedBy",
                    docCount: { $sum: 1 },
                    totalDownloads: { $sum: "$downloadCount" }
                }
            },
            { $sort: { docCount: -1 } },
            { $limit: 10 },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "user"
                }
            },
            { $unwind: "$user" },
            {
                $project: {
                    name: "$user.name",
                    username: "$user.username",
                    shopName: "$user.shopName",
                    docCount: 1,
                    totalDownloads: 1
                }
            }
        ]);
        res.json(tops);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    View/Stream a document (Proxy with Signed URLs to bypass CDN blocks)
// @route   GET /api/documents/:id/view
// @access  Private
const viewDocument = async (req, res) => {
    try {
        const doc = await Document.findById(req.params.id);
        if (!doc) return res.status(404).json({ message: 'Document not found' });

        // Visibility logic
        if (!['admin', 'staff'].includes(req.user.role)) {
            const isOwner = doc.uploadedBy.toString() === req.user._id.toString();
            const isApproved = doc.status === 'approved';
            if (!isOwner && !isApproved) {
                return res.status(403).json({ message: 'Not authorized to view this document' });
            }
        }

        // Generate a signed URL to bypass "deny or ACL failure" (Cloudinary Delivery Blocks)
        // Explicitly setting type: 'upload' and forced secure: true
        const signedUrl = cloudinary.url(doc.filePublicId, {
            resource_type: doc.fileResourceType || 'image',
            type: 'upload',
            secure: true,
            sign_url: true,
        });

        https.get(signedUrl, (proxyRes) => {
            // Check if Cloudinary returned an error
            if (proxyRes.statusCode !== 200) {
                console.error(`Cloudinary error ${proxyRes.statusCode} for signed URL: ${signedUrl}`);
                console.error('Cloudinary headers:', proxyRes.headers['x-cld-error'] || 'No x-cld-error header');
                res.status(proxyRes.statusCode).json({
                    message: 'Error fetching document from storage',
                    error: proxyRes.headers['x-cld-error']
                });
                return;
            }

            // Forward headers
            res.set('Content-Type', doc.fileType || 'application/pdf');

            if (req.query.download === 'true') {
                res.set('Content-Disposition', `attachment; filename="${doc.fileName || 'document.pdf'}"`);
            } else {
                res.set('Content-Disposition', 'inline');
            }

            proxyRes.pipe(res);
        }).on('error', (err) => {
            console.error('Streaming error:', err);
            res.status(500).json({ message: 'Error streaming document' });
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    uploadDocument,
    getDocuments,
    deleteDocument,
    updateDocumentStatus,
    incrementDownload,
    getDocumentStats,
    getTopContributors,
    viewDocument,
    checkSimilarity
};
