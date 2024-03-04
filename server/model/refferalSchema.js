
const mongoose = require('mongoose');

    
const schema = new mongoose.Schema({
    referralAmount:{
        type:Number,
        required:true
        
    },
    referredAmount:{
        type:Number,
        required:true
       
    },
    expiredate:{  
        type:Date,
        required:true
    }
  
});

const referraldb = mongoose.model('referralOffer',schema);


module.exports =referraldb;