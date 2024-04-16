// const mongoose = require('mongoose')

// // Define the product schema 
// const schema = new mongoose.Schema({
//     email:{
//         type:String
//     },
//     otp:String,
//     createdAt:Date,
//     expiresAt:Date,

// })

// // Create a mongoose model using the product schema 
// const OTP = mongoose.model('OTP',schema)

// // Export the product model 
// module.exports = OTP


const mongoose = require('mongoose');


const schema = new mongoose.Schema({
    email: {
        type: String
    },
    otp: String,
    createdAt: {
        type: Date,
        default: Date.now
    },
    expiresAt: {
        type: Date,
       
        default: () => new Date(+new Date() + 60 * 1000)  
    }
});


schema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const OTP = mongoose.model('OTP', schema);

module.exports = OTP;
