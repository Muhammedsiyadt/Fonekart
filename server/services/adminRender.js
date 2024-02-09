

const axios = require('axios')

// User Schema importing--------------------------
const Userdb = require('../model/userSchema')

// Category Schema importing ---------------------
// const categorySchema = require('../model/categorySchema')
const categorydb = require('../model/categorySchema')

// product schema 
const productdb = require('../model/productSchema') 

// cart Schema
const cartdb = require('../model/cartSchema')

// Order Schema
const orderdb = require('../model/orderSchema')

// coupon schema
const coupondb = require('../model/couponSchema')





//  Login page
exports.login = (req, res) => { 
    res.render('adminlogin')
}


// home page 
exports.home = (req, res) => {
        res.render('adminhome' )

}




// User_management page 
// exports.User_management = (req,res) => {

//  axios.get(`http://localhost:${process.env.PORT}/admin/findUserManagment`)


//  .then((response)=>{

//     res.render('User_management',{user:response.data})


//  }).catch((err)=>{
//     res.send(err)
//  })


// } 

// User management---
exports.User_management = async (req, res) => {
    try {

        const usersData = await Userdb.find()
        //    console.log(usersData);

        res.render('User_management', { user: usersData })

    } catch (error) {
        console.log(error);
    }
}


// Order_management page
exports.Order_management = async (req, res) => {

    try {
        const find = await orderdb.find({})
        // console.log(find);
        res.render('Order_management',{Order : find})
    } catch (error) {
        console.log(error)
    }
}


// CATEGORY MANAGEMENT PAGE -------------------------------------------------------------------
exports.Categary_management = async (req, res) => {
    try {
        const CategoryData = await categorydb.find({delete:false})

        res.render('Categary_management', { CategoryDetails: CategoryData })


    } catch (error) {
        console.log(error);
    }
}

// add-category page
exports.add_category = (req, res) => { 
   try {
    res.render('add_category')
   } catch (error) {
    res.send(error)
   }
}
// Edit category 
exports.edit_category = async (req, res) => {

    try {
        
        //const categoryIdPass = req.query.id
        const categoryIdPass = await categorydb.findOne({ _id: req.query.id })
        // console.log(categoryIdPass);
        // res.render('edit_category',{editCategory : categoryIdPass , })  

        res.render('edit_category', {editCategory : categoryIdPass , message: req.session.message }, (err, html) => {
            if (err) {
                res.send(err)
            }

            delete req.session.message

            res.send(html)
        })
    } catch (error) {
        console.log(error);
    }
} 

// delete category
exports.deletecategory = async (req,res) => {
    try {
        const unlistedData = await categorydb.find({delete:true}) 
        res.render('unlistedcategory',{unlist:unlistedData})
    } catch (error) {
        console.log(error);
    }
}


// ------------------------------------------------------------------------------------
// PRODUCE MANAGEMENT PAGE-------------------------------------------------------------
exports.product_management = async (req, res) => {
    try {

        const productData = await productdb.find({delete:false})
        // console.log(productData);
        res.render('product_management',{product : productData})
    } catch (error) {
        console.log(error);
    }
}

// add product 
exports.add_product = async (req,res) => {
    try {
        const category =await categorydb.find({delete:false})   
        res.render('add_product',{ categoryData :  category})
        // console.log(category);
    } catch (error) {
        console.log(error); 
        
    }
}

// Edit product 
exports.edit_product = async (req,res) => {
    try {
        const productIdPass = await productdb.findOne({_id:req.query.id})  
        const category = await categorydb.find({delete:false})
 
        res.render('edit_product',{editProduct : productIdPass , categorydata : category})  
    } catch (error) {
        console.log(error);
    }
}

// delete to unlist page 
exports.deleteToUnlist = async (req,res) => {
   try {
    const unlistProductId = await productdb.find({delete:true})  
    // console.log(unlistProductId);
    res.render('unlistedproducts',{unlistProduct : unlistProductId})
   } catch (error) {
    console.log(error);
   }
}



// -------------------------------------------------------------------------------------
// COUPON MANAGEMENT
// Coupon_management page
exports.Coupon_management = async(req, res) => {
    try {

        const currentDate = Date.now()
        await coupondb.updateMany({expiryDate : {$gte : currentDate}} , {$set: {status : true}})
        await coupondb.updateMany({expiryDate : {$lte : currentDate}} , {$set: {status : false}})

        const findCoupons = await coupondb.find()
        // console.log(findCoupons);

        res.render('Coupon_management' , {coupons : findCoupons})
    } catch (error) {
        console.log(error);
    }
}

// add coupon page 
exports.addCoupon = (req,res) => {
    res.render('addCoupon')
}

// Edit Coupon 
exports.editCoupon = async (req,res) => {
    try {
        const query = req.query.id
        const findSpesificCoupon = await coupondb.findOne({_id:query}) 
        res.render('editCoupon' , {coupon : findSpesificCoupon})
    } catch (error) {
        
    }
}


// -------------------------------------------------------------------------------
// OFFER MANAGEMENT //
//offer management page 
exports.Offer_management = (req,res) => {
    res.render('offer_management')
}