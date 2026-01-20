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

        // Allow login with either username or mobile number
        const user = await User.findOne({
            $or: [{ username: username }, { mobileNumber: username }]
        });

        if (user && (await user.matchPassword(password))) {
            if (!user.isActive) {
                res.status(401);
                throw new Error('Account is blocked. Contact Admin.');
            }

            res.json({
                _id: user._id,
                username: user.username,
                role: user.role,
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
