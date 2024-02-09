

const mongoose = require('mongoose');

// Define the Coupen schema
const schema = new mongoose.Schema({
    Code: {
        type: String,
        required: true
    },

    Discount: {
        type: Number,
        required: true
    },
    Maxuse: {
        type: Number,
        required: true
    },
    MaxPrice: {
        type: Number,
        required: true
    },
    expiryDate: {
        type: Date,
        required: true
    },
    createdDate: {
        type: Date,
        required: true,
        default: Date.now()
    },
    status: {
        type:Boolean,
        default:true
    }
});

// Create a mongoose model using the product schema
const coupendb = mongoose.model('coupendb', schema);

// Export the Product model
module.exports = coupendb