
const mongoose = require('mongoose');

    
const schema = new mongoose.Schema({
    referralRewards:{
        type:Number,
        required:true
        
    },
    referralUserRewards:{
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