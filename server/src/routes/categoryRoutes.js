const express = require('express');
const router = express.Router();
const { getCategories, createCategory, deleteCategory } = require('../controllers/categoryController');
const { protect, admin } = require('../middleware/authMiddleware');

// Middleware: only vle, akshaya, admin allowed
const vleOrAdmin = (req, res, next) => {
    if (['vle', 'akshaya', 'admin'].includes(req.user?.role)) {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized' });
    }
};

router.route('/')
    .get(getCategories)
    .post(protect, vleOrAdmin, createCategory);

router.route('/:id')
    .delete(protect, vleOrAdmin, deleteCategory);

module.exports = router;
