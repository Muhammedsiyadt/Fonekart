
const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    user_id: {
        type: mongoose.SchemaTypes.ObjectId,
        required: true
    },
    cartItems: [{
        productId: {
            type: mongoose.SchemaTypes.ObjectId,
            required: true
        },
        quantity: {
            type: Number,
            default: 1
        }
    }]
})

const cartdb = mongoose.model('cartdb',schema)

module.exports = cartdb