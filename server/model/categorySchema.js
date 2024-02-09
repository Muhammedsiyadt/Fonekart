const mongoose = require('mongoose')

// For multiple images
const schema = new mongoose.Schema({
    category: {
        type: String,
        required: true
    },
    image: {
        type: [String],  // Array of strings for multiple images
        default: []
    },
    delete: {
        type: Boolean,
        default: false
    }
});


const categorydb = mongoose.model('Category',schema)

module.exports = categorydb