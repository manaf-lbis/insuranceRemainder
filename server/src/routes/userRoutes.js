const express = require('express');
const router = express.Router();
const { registerUser, getUsers, toggleBlockStatus, resetPassword, updateUserProfile } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// Middleware to check if user is admin
const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(401);
        throw new Error('Not authorized as an admin');
    }
};

router.route('/')
    .post(protect, admin, registerUser)
    .get(protect, admin, getUsers);

router.route('/:id/block')
    .put(protect, admin, toggleBlockStatus);

router.route('/:id/reset-password')
    .put(protect, admin, resetPassword);

router.route('/profile')
    .put(protect, updateUserProfile);

module.exports = router;
