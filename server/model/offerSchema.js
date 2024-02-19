const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    discount: {
        type: Number,
        required: true
    },
    expirydate: {
        type: Date,
        required: true
    }
});

const offerdb = mongoose.model('Offer', schema);

module.exports = offerdb;
