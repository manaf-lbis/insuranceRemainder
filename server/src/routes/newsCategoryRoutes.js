const express = require('express');
const router = express.Router();
const {
    getNewsCategories,
    createNewsCategory,
    deleteNewsCategory
} = require('../controllers/newsCategoryController');
const { protect, admin } = require('../middleware/authMiddleware'); // Assuming auth middleware exists

router.route('/')
    .get(getNewsCategories)
    .post(protect, admin, createNewsCategory);

router.route('/:id')
    .delete(protect, admin, deleteNewsCategory);

module.exports = router;
