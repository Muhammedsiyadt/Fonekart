
const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    user_id: {
        type: mongoose.SchemaTypes.ObjectId,
        required: true
    },
    wishlistItems: [{
        productId: {
            type: mongoose.SchemaTypes.ObjectId,
            required: true
        }
    }]
})

const wishlistdb = mongoose.model('wishlistdb',schema)

module.exports = wishlistdb