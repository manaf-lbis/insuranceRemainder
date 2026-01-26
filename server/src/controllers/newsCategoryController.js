const NewsCategory = require('../models/NewsCategory');

// @desc    Get all categories
// @route   GET /api/news-categories
// @access  Public
exports.getNewsCategories = async (req, res) => {
    try {
        const categories = await NewsCategory.find().sort({ name: 1 });
        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a category
// @route   POST /api/news-categories
// @access  Private/Admin
exports.createNewsCategory = async (req, res) => {
    try {
        const { name } = req.body;

        const categoryExists = await NewsCategory.findOne({ name });
        if (categoryExists) {
            return res.status(400).json({ message: 'Category already exists' });
        }

        const category = await NewsCategory.create({ name });
        res.status(201).json(category);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete a category
// @route   DELETE /api/news-categories/:id
// @access  Private/Admin
exports.deleteNewsCategory = async (req, res) => {
    try {
        const category = await NewsCategory.findById(req.params.id);

        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        await category.deleteOne();
        res.status(200).json({ id: req.params.id });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
