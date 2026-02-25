const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secret123', {
        expiresIn: '365d',
    });
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Allow login with username, email (lowercased), or mobile number
        const user = await User.findOne({
            $or: [
                { username: username },
                { email: username?.toLowerCase() },
                { mobileNumber: username }
            ]
        });

        if (user && (await user.matchPassword(password))) {
            // Check email verification for VLE/Akshaya roles
            if (['vle', 'akshaya'].includes(user.role) && !user.isEmailVerified) {
                return res.status(401).json({
                    message: 'Please verify your email first.',
                    userId: user._id,
                    needsVerification: true,
                    email: user.email
                });
            }

            if (['vle', 'akshaya'].includes(user.role) && !user.isApproved) {
                return res.status(401).json({
                    message: 'Account is pending approval. Please wait for Admin to approve your account access.',
                    pendingApproval: true
                });
            }

            if (!user.isActive) {
                return res.status(401).json({ message: 'Account is blocked. Contact Admin.' });
            }

            user.lastLogin = new Date();
            await user.save();

            res.json({
                _id: user._id,
                username: user.username,
                name: user.name,
                email: user.email,
                role: user.role,
                shopName: user.shopName,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid username or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { loginUser };
