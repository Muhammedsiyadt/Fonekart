
const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    user_Id: {
        type: mongoose.SchemaTypes.ObjectId,
        required: true
    },
    address: [
        {
            name: {
                type: String,
                required: true
            },
            pin: {
                type: Number,
                required: true
            },
            address: {
                type: String,
                required: true
            },
            district: {
                type: String,
                required: true
            },
            city: {
                type: String,
                required: true
            },
            phone: {
                type: Number,
                required: true
            },
            defaultAddress:{
                type:Boolean,
                default:true,
                required:true 
            }
        }
    ]
})

const addressSchema = mongoose.model('address', schema)

module.exports = addressSchema

