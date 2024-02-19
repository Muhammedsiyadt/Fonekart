const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');

var productSchema = new mongoose.Schema({
    Pname: { 
        type: String, 
        required: true 
    },
    images:{
        type:Array,
        required:true
    },
    Pcategory:{
        type:String,
        required:true
    },
    price:{
        type:String,
        required:true
    },
    quantity:{
        type:Number,
        required:true
    },
    Pmodel:{
        type:String,
        required:true
    },
    color:{
        type:String,
        required:true
    },
    delete:{
        type:Boolean,
        default:false
    },
    offerId:{
        type:ObjectId
    }
    
}) 

const productdb = mongoose.model('productdb', productSchema);

module.exports = productdb;