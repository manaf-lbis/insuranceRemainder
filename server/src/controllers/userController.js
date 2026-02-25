const userRepository = require('../repositories/userRepository');
const User = require('../models/User');
const Issue = require('../models/Issue');

// @desc    Register a new user (Staff)
// @route   POST /api/users
// @access  Private/Admin
const registerUser = async (req, res) => {
    try {
        const { username, password, mobileNumber, name } = req.body;

        const userExists = await User.findOne({ username });
        if (userExists) {
            res.status(400);
            throw new Error('User already exists');
        }

        // Create user with default role 'staff' and createdBy
        const user = await User.create({
            username,
            password,
            mobileNumber,
            role: 'staff',
            createdBy: req.user._id,
            isActive: true,
            isApproved: true // Admin created staff are implicitly approved
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                username: user.username,
                role: user.role,
                isActive: user.isActive,
                mobileNumber: user.mobileNumber
            });
        } else {
            res.status(400);
            throw new Error('Invalid user data');
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = async (req, res) => {
    try {
        const { page = 1, limit = 10, status } = req.query;
        const skip = (page - 1) * limit;

        let filter = {};
        if (status === 'active') {
            filter = { isActive: true, isApproved: true };
        } else if (status === 'pending') {
            filter = { isApproved: false, isEmailVerified: true };
        } else if (status === 'blocked') {
            filter = { isActive: false };
        }

        const [total, users] = await Promise.all([
            userRepository.count(filter),
            userRepository.find(filter, { createdAt: -1 }, '-password', { skip, limit })
        ]);

        res.status(200).json({
            users,
            total,
            page: Number(page),
            pages: Math.ceil(total / limit)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Toggle Block Status
// @route   PUT /api/users/:id/block
// @access  Private/Admin
const toggleBlockStatus = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            res.status(404);
            throw new Error('User not found');
        }

        if (user.role === 'admin') {
            res.status(400);
            throw new Error('Cannot block an admin');
        }

        user.isActive = !user.isActive;
        await user.save();

        res.status(200).json({
            _id: user._id,
            username: user.username,
            isActive: user.isActive,
            message: `User ${user.isActive ? 'unblocked' : 'blocked'} successfully`
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Approve User
// @route   PUT /api/users/:id/approve
// @access  Private/Admin
const approveUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            res.status(404);
            throw new Error('User not found');
        }

        if (user.isApproved) {
            res.status(400);
            throw new Error('User is already approved');
        }

        user.isApproved = true;
        // user.isActive = true; // Ensure they are active when approved
        await user.save();

        // Send welcome email after approval
        const { sendWelcomeEmail } = require('../services/emailService');
        try {
            await sendWelcomeEmail(user.email, user.name, user.role);
        } catch (emailErr) {
            console.error('Welcome email failed (non-fatal):', emailErr.message);
        }

        res.status(200).json({
            _id: user._id,
            username: user.username,
            isApproved: user.isApproved,
            message: 'User approved successfully'
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Reset Password
// @route   PUT /api/users/:id/reset-password
// @access  Private/Admin
const resetPassword = async (req, res) => {
    try {
        const { password } = req.body;
        const user = await User.findById(req.params.id);

        if (!user) {
            res.status(404);
            throw new Error('User not found');
        }

        user.password = password; // Will be hashed by pre-save hook
        await user.save();

        res.status(200).json({ message: 'Password reset successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update User Profile (Change Password)
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            if (req.body.password) {
                user.password = req.body.password;
            }
            // Can update other fields here if needed e.g. name/mobile

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                username: updatedUser.username,
                role: updatedUser.role,
                isActive: updatedUser.isActive,
                mobileNumber: updatedUser.mobileNumber,
                token: req.body.token // Keep existing token or regen if needed (usually keep)
            });
        } else {
            res.status(404);
            throw new Error('User not found');
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update user details (Admin only)
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            res.status(404);
            throw new Error('User not found');
        }

        user.name = req.body.name || user.name;
        user.username = req.body.username || user.username;
        user.mobileNumber = req.body.mobileNumber || user.mobileNumber;
        user.role = req.body.role || user.role;
        user.shopName = req.body.shopName || user.shopName;
        user.email = req.body.email || user.email;

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            username: updatedUser.username,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            mobileNumber: updatedUser.mobileNumber,
            shopName: updatedUser.shopName,
            isActive: updatedUser.isActive
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get counts for admin badges (Pending Users, Pending Issues)
// @route   GET /api/users/admin-badges
// @access  Private/Admin
const getAdminBadges = async (req, res) => {
    try {
        const [pendingUsers, pendingIssues] = await Promise.all([
            User.countDocuments({ isApproved: false, isEmailVerified: true }),
            Issue.countDocuments({ status: { $in: ['open', 'in_progress'] } })
        ]);

        res.json({
            pendingUsers,
            pendingIssues
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    registerUser,
    getUsers,
    toggleBlockStatus,
    approveUser,
    resetPassword,
    updateUserProfile,
    updateUser,
    getAdminBadges
};
