const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { sendOtpEmail, sendWelcomeEmail } = require('../services/emailService');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secret123', {
        expiresIn: '365d',
    });
};

const generateOtp = () => {
    return crypto.randomInt(100000, 999999).toString();
};

const BLOCKED_DOMAINS = [
    // Standard Dummy/Temp Mail Domains
    'temp-mail.org', 'guerrillamail.com', '10minutemail.com', 'mailinator.com',
    'yopmail.com', 'throwawaymail.com', 'tempmail.com', 'getnada.com',
    'mytemp.email', 'dropmail.me', 'dispostable.com', 'maildrop.cc',
    'temp-mail.io', 'mailnesia.com', 'minuteinbox.com', 'tempmailo.com',
    'mohmal.com', 'tempinbox.com', 'sharklasers.com', 'tempail.com',
    'tempail.org', 'trashmail.com', 'inbox.lv', '10minutemail.net',

    // Random Generators / Burners
    'generator.email', 'email-fake.com', 'fake-mail.net', 'fakemail.net',
    'crazymailing.com', 'trash-mail.com', 'bouncr.com', 'spamgourmet.com',
    '33mail.com', 'anonbox.net', 'anonymbox.com', 'mailcatch.com',
    'mailcatch.net', 'mailinc.com', 'maildrop.mobi', 'mailnull.com'
];

const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return false;

    const domain = email.split('@')[1]?.toLowerCase();
    if (BLOCKED_DOMAINS.includes(domain)) return false;

    return true;
};

// @desc    VLE/Akshaya Signup — creates unverified user and sends OTP
// @route   POST /api/vle-auth/signup
// @access  Public
const signup = async (req, res) => {
    try {
        const { name, email, username, password, mobileNumber, shopName, role } = req.body;

        // Only allow vle or akshaya role via this endpoint
        if (!['vle', 'akshaya'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role. Must be vle or akshaya.' });
        }

        if (!email || !isValidEmail(email)) {
            return res.status(400).json({ message: 'Please provide a valid, non-temporary email address' });
        }

        if (!mobileNumber || !/^[0-9]{10}$/.test(mobileNumber)) {
            return res.status(400).json({ message: 'Please provide a valid 10-digit mobile number' });
        }

        const emailExists = await User.findOne({ email: email.toLowerCase() });
        if (emailExists) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        const effectiveUsername = email.toLowerCase();

        const otp = generateOtp();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        const user = await User.create({
            name,
            email: email.toLowerCase(),
            username: effectiveUsername,
            password,
            mobileNumber,
            shopName,
            role,
            isEmailVerified: false,
            isActive: true, // Active by default (can be blocked later)
            isApproved: false, // Inactive until admin approves
            otpCode: otp,
            otpExpiry,
            otpType: 'signup',
        });

        // Send OTP email
        await sendOtpEmail(email, name, otp, 'signup');

        res.status(201).json({
            message: 'Registration successful! Please verify your email with the OTP sent.',
            userId: user._id,
            email: user.email,
        });
    } catch (error) {
        console.error('VLE Signup error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Verify OTP (for signup)
// @route   POST /api/vle-auth/verify-otp
// @access  Public
const verifyOtp = async (req, res) => {
    try {
        const { userId, otp } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.isEmailVerified) {
            return res.status(400).json({ message: 'Email already verified' });
        }

        if (user.otpType !== 'signup') {
            return res.status(400).json({ message: 'Invalid OTP type' });
        }

        if (!user.otpCode || user.otpCode !== otp) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        if (new Date() > user.otpExpiry) {
            return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
        }

        // Mark as verified
        user.isEmailVerified = true;
        // user.isActive = true; // Stay active, but isApproved remains false
        user.otpCode = undefined;
        user.otpExpiry = undefined;
        user.otpType = undefined;
        await user.save();

        res.json({ message: 'Email verified successfully! Please wait for Admin to approve your account access.' });
    } catch (error) {
        console.error('VLE OTP verify error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Resend OTP
// @route   POST /api/vle-auth/resend-otp
// @access  Public
const resendOtp = async (req, res) => {
    try {
        const { userId } = req.body;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.isEmailVerified) {
            return res.status(400).json({ message: 'Email already verified' });
        }

        const otp = generateOtp();
        user.otpCode = otp;
        user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
        user.otpType = 'signup';
        await user.save();

        await sendOtpEmail(user.email, user.name, otp, 'signup');

        res.json({ message: 'OTP resent to your email.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    VLE/Akshaya Login
// @route   POST /api/vle-auth/login
// @access  Public
const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({
            $or: [{ username }, { email: username?.toLowerCase() }, { mobileNumber: username }]
        });

        if (!user || !['vle', 'akshaya'].includes(user.role)) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        if (!user.isEmailVerified) {
            return res.status(401).json({
                message: 'Please verify your email first.',
                userId: user._id,
                needsVerification: true,
            });
        }

        if (!user.isApproved) {
            return res.status(401).json({
                message: 'Account is pending approval. Please wait for Admin to approve your account access.',
                pendingApproval: true
            });
        }

        if (!user.isActive) {
            return res.status(401).json({
                message: 'Account is blocked. Please contact Admin.',
                isBlocked: true
            });
        }


        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
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
    } catch (error) {
        console.error('VLE Login error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Forgot Password — send OTP to email
// @route   POST /api/vle-auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email: email?.toLowerCase() });
        if (!user || !['vle', 'akshaya'].includes(user.role)) {
            // Generic message to prevent user enumeration
            return res.json({ message: 'If this email is registered, an OTP has been sent.' });
        }

        const otp = generateOtp();
        user.otpCode = otp;
        user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
        user.otpType = 'forgot-password';
        await user.save();

        await sendOtpEmail(email, user.name, otp, 'forgot-password');

        res.json({
            message: 'If this email is registered, an OTP has been sent.',
            userId: user._id,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Reset Password using OTP
// @route   POST /api/vle-auth/reset-password
// @access  Public
const resetPassword = async (req, res) => {
    try {
        const { userId, otp, newPassword } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.otpType !== 'forgot-password') {
            return res.status(400).json({ message: 'Invalid OTP type' });
        }

        if (!user.otpCode || user.otpCode !== otp) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        if (new Date() > user.otpExpiry) {
            return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
        }

        user.password = newPassword; // Pre-save hook will hash it
        user.otpCode = undefined;
        user.otpExpiry = undefined;
        user.otpType = undefined;
        await user.save();

        res.json({ message: 'Password reset successfully. You can now log in.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { signup, verifyOtp, resendOtp, login, forgotPassword, resetPassword };
