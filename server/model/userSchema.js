const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

var schema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true,
    },
    status:{
        type:String,
        default:'inActive'

    },
    block:{
        type:Boolean,
        default:false
    },
    referralCode:{
        type:String,
        unique:true,
        required:true
    }   

})

const Userdb = mongoose.model('userdb',schema)

module.exports = Userdb  
  

