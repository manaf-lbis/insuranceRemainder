const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        sparse: true, // Allow being null if not provided
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['admin', 'staff', 'vle', 'akshaya'],
        default: 'staff',
    },
    name: {
        type: String,
    },
    email: {
        type: String,
        sparse: true,
        lowercase: true,
    },
    shopName: {
        type: String,
    },
    mobileNumber: {
        type: String,
        validate: {
            validator: function (v) {
                return v == null || v === '' || /^[0-9]{10}$/.test(v);
            },
            message: 'Please add a valid 10-digit mobile number'
        }
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    isApproved: {
        type: Boolean,
        default: false,
    },
    isEmailVerified: {
        type: Boolean,
        default: false,
    },
    otpCode: {
        type: String,
    },
    otpExpiry: {
        type: Date,
    },
    otpType: {
        type: String,
        enum: ['signup', 'forgot-password'],
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    lastLogin: {
        type: Date,
    },
}, {
    timestamps: true,
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Encrypt password using bcrypt
userSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

module.exports = mongoose.model('User', userSchema);
