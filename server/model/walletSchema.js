const mongoose = require('mongoose')
const walletSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
    },
    balance: {
        type: Number,
        default: 0
    },
    transactions: [
        {
            amount: {
                type: Number
            },
            date: {
                type: Date,
                default: Date.now
            }
        }
    ]
})

const walletdb = mongoose.model('walletdb', walletSchema)

module.exports = walletdb