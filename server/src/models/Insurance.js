const mongoose = require('mongoose');

const insuranceSchema = new mongoose.Schema({
    registrationNumber: {
        type: String,
        required: [true, 'Registration number is required'],
        uppercase: true,
        trim: true,
        set: v => v.replace(/[\s-]/g, '').toUpperCase()
    },
    customerName: {
        type: String,
        required: [true, 'Customer name is required'],
        trim: true,
    },
    mobileNumber: {
        type: String,
        required: [true, 'Mobile number is required'],
        match: [/^[0-9]{10}$/, 'Please add a valid 10-digit mobile number'],
    },
    alternateMobileNumber: {
        type: String,
        match: [/^[0-9]{10}$/, 'Please add a valid 10-digit mobile number'],
    },
    vehicleType: {
        type: String,
        required: [true, 'Vehicle type is required'],
        enum: ['Two Wheeler', 'Four Wheeler', 'Goods Vehicle', 'Passenger Vehicle'],
    },
    insuranceType: {
        type: String,
        required: [true, 'Insurance type is required'],
        enum: ['Third Party', 'Package (Full Cover)', 'Standalone OD'],
    },
    policyStartDate: {
        type: Date,
        required: [true, 'Policy start date is required'],
    },
    policyExpiryDate: {
        type: Date,
        required: [true, 'Policy expiry date is required'],
    },
    duration: {
        type: String,
        enum: ['1 Year', '2 Years', '3 Years', '4 Years', 'Custom'],
        default: '1 Year',
    },
    remarks: {
        type: String,
        trim: true,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    isDeleted: {
        type: Boolean,
        default: false,
        index: true
    },
    deletedAt: {
        type: Date
    },
    deletedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true,
});

// Validation: Ensure expiry date is after start date
insuranceSchema.pre('save', function (next) {
    if (this.policyExpiryDate <= this.policyStartDate) {
        next(new Error('Policy expiry date must be after start date'));
    } else {
        next();
    }
});

module.exports = mongoose.model('Insurance', insuranceSchema);
