
const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    user_id: {
        type: mongoose.SchemaTypes.ObjectId,
        required: true
    },
    orderItems: [{
        productId: {
            type: mongoose.SchemaTypes.ObjectId,
            required: true
        },
        quantity: {
            type: Number,
            required: true
        },
        Pname: {
            type: String,
            required: true
        },
        category: {
            type: String,
            required: true
        },
        // descriptionHead: {
        //     type: String
        // }, 
        price: {
            type: Number,
            required: true
        },
        // mrp: {
        //     type: Number,
        //     required: true
        // },
        // discount: {
        //     type: Number,
        //     required: true
        // },
        color: {
            type: String,
            required: true
        },
        Image: [{
            type: String,
            required: true
        }],
        orderStatus: {
            type: String,
            default: "ordered",
            required: true
        }
        ,
        returnReason: {
            type: String
        }
        // ,
        // cancelReason: {
        //     type: String
        // }
    }],
    paymentMethod: {
        type: String,
        required: true
    },
    orderDate: {
        type: Date,
        default: Date.now()
    },
    address: {
        name: {
            type: String,
            required: true
        },
        address: {
            type: String,
            required: true
        },
        phone: {
            type: Number,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        pin: {
            type: Number,
            required: true
        },
        district: {
            type:String,
            required:true
        }
    },
    totalAmount: {
        type: Number
    },
    couponId: {
        type: mongoose.SchemaTypes.ObjectId
    }

})

const orderdb = mongoose.model('orderdb',schema)

module.exports = orderdb