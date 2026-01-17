const mongoose = require('mongoose');

const insuranceSchema = new mongoose.Schema({
    registrationNumber: {
        type: String,
        required: [true, 'Registration number is required'],
        uppercase: true,
        trim: true,
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
        enum: ['Third Party', 'Package', 'Standalone OD'],
    },
    policyStartDate: {
        type: Date,
        required: [true, 'Policy start date is required'],
    },
    policyExpiryDate: {
        type: Date,
        required: [true, 'Policy expiry date is required'],
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
}, {
    timestamps: true,
});

module.exports = mongoose.model('Insurance', insuranceSchema);
