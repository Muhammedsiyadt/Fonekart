

const axios = require('axios')
const Userdb = require('../model/userSchema')
const categorydb = require('../model/categorySchema')
const productdb = require('../model/productSchema')
const cartdb = require('../model/cartSchema')
const orderdb = require('../model/orderSchema')
const coupondb = require('../model/couponSchema')
const offerdb = require('../model/offerSchema')
const refferaldb = require('../model/refferalSchema')
const walletdb = require('../model/walletSchema')






//  Login page
exports.login = (req, res) => {
    res.render('adminlogin')
}


// home page 
exports.home = async (req, res) => {
    const countUsers = await Userdb.countDocuments();
    const ordercount = await orderdb.countDocuments()
    const [orderTotalAmountObject] = await orderdb.aggregate([
        {
            $unwind: "$orderItems"
        },
        {
            $group: {
                _id: "$_id",
                totalPrice: { $sum: "$orderItems.price" }
            }
        },
        {
            $group: {
                _id: null,
                totalAmount: { $sum: "$totalPrice" }
            }
        }
    ]);

    const orderTotalAmount = orderTotalAmountObject ? orderTotalAmountObject.totalAmount : undefined;

    res.render('adminhome', { countUser: countUsers, ordercount: ordercount, orderTotalAmount: orderTotalAmount })

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

        const page = req.query.page || 1;
        const limit = 4

        const find = await orderdb.aggregate(
            [
                {
                    '$match': {

                    }
                },
                {
                    '$unwind': {
                        'path': '$orderItems'
                    }
                },
                {
                    '$lookup': {
                        'from': 'userdbs',
                        'localField': 'userId',
                        'foreignField': '_id',
                        'as': 'userDetails'
                    }
                },
                {
                    $sort: { orderDate: -1 }
                },
                {
                    $skip: limit * (page - 1)
                },
                {
                    $limit: limit
                }

            ]
        )

        // await PageNation('Order');
        const totalOrders = await orderdb.aggregate([
            {
                $unwind: {
                    path: "$orderItems",
                },
            },
            {
                $lookup: {
                    from: "userdbs",
                    localField: "userId",
                    foreignField: "_id",
                    as: "userInfo",
                },

            },

            {
                $group: {
                    _id: null,
                    count: { $sum: 1 }
                }
            }
        ])

        const totalPages = Math.ceil(totalOrders[0].count / limit)
        if (totalOrders && totalOrders.length > 0) {
            const totalPages = Math.ceil(totalOrders[0].count / limit);

        } else {
            console.error('Error: totalOrders is empty or undefined');

        }

        res.render('Order_management', { Order: find, totalPages: totalPages })

    } catch (error) {
        console.log(error)
    }
}


// CATEGORY MANAGEMENT PAGE -------------------------------------------------------------------
exports.Categary_management = async (req, res) => {
    try {
        const CategoryData = await categorydb.find({ delete: false })

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

        const categoryIdPass = await categorydb.findOne({ _id: req.query.id })
        res.render('edit_category', { editCategory: categoryIdPass, message: req.session.message }, (err, html) => {
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
exports.deletecategory = async (req, res) => {
    try {
        const unlistedData = await categorydb.find({ delete: true })
        res.render('unlistedcategory', { unlist: unlistedData })
    } catch (error) {
        console.log(error);
    }
}


// ------------------------------------------------------------------------------------
// PRODUCT MANAGEMENT PAGE-------------------------------------------------------------
exports.product_management = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 6;
        const startIndex = (page - 1) * limit;

        const productData = await productdb.find({ delete: false }).skip(startIndex).limit(limit);


        const totalCount = await productdb.countDocuments({ delete: false });


        const totalPages = Math.ceil(totalCount / limit);

        res.render('product_management', { product: productData, totalPages: totalPages, currentPage: page })

    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
    }
}


// add product 
exports.add_product = async (req, res) => {
    try {
        const category = await categorydb.find({ delete: false })
        res.render('add_product', { categoryData: category })
        // console.log(category);
    } catch (error) {
        console.log(error);

    }
}

// Edit product 
exports.edit_product = async (req, res) => {
    try {
        const productIdPass = await productdb.findOne({ _id: req.query.id })
        const category = await categorydb.find({ delete: false })

        res.render('edit_product', { editProduct: productIdPass, categorydata: category })
    } catch (error) {
        console.log(error);
    }
}

// delete to unlist page 
exports.deleteToUnlist = async (req, res) => {
    try {
        const unlistProductId = await productdb.find({ delete: true })
        // console.log(unlistProductId);
        res.render('unlistedproducts', { unlistProduct: unlistProductId })
    } catch (error) {
        console.log(error);
    }
}



// -------------------------------------------------------------------------------------
// COUPON MANAGEMENT 
// Coupon_management page
exports.Coupon_management = async (req, res) => {
    try {

        const page = parseInt(req.query.page) || 1
        const limit = 5
        const startIndex = (page - 1) * limit

        const currentDate = Date.now();
        await coupondb.updateMany({ expiryDate: { $gte: currentDate } }, { $set: { status: true } })
        await coupondb.updateMany({ expiryDate: { $lte: currentDate } }, { $set: { status: false } })

        const findCoupons = await coupondb.find().skip(startIndex).limit(limit)

        const totalCount = await coupondb.countDocuments()

        const totalPages = Math.ceil(totalCount / limit)

        res.render('Coupon_management', { coupons: findCoupons, totalPages: totalPages, currentPage: page })
    } catch (error) {
        console.log(error)
        res.status(500).send('Internal Server Error')
    }
}


// add coupon page 
exports.
addCoupon = (req, res) => {

    const samecoupon = req.session.Existmessage;

  
    delete req.session.Existmessage;

    if (samecoupon) {

        res.render('addCoupon', { samecoupon: samecoupon });
    } else {

        res.render('addCoupon');
    }
};


// Edit Coupon 
exports.editCoupon = async (req, res) => {
    try {
        const query = req.query.id
        const findSpesificCoupon = await coupondb.findOne({ _id: query })
        res.render('editCoupon', { coupon: findSpesificCoupon })
    } catch (error) {

    }
}


// -------------------------------------------------------------------------------
// OFFER MANAGEMENT //
//offer management page 
exports.Offer_management = async (req, res) => {
    try {
        const data = await offerdb.find()
        res.render('offer_management', { offerData: data })
    } catch (error) {
        console.log(error);
    }
}

// Add category offer
exports.addCategoryOffer = async (req, res) => {

    try {
        const category = await categorydb.find({ delete: false })
        res.render('addCategoryOffer', { categoryData: category })
    } catch (error) {
        console.log(error);

    }
}

exports.productOffer = async (req, res) => {

    try {
        const product = await productdb.find({ delete: false })
        res.render('addProductOffer', { productData: product })
    } catch (error) {
        console.log(error);

    }
}


// === REFFERAL OFFER === //
exports.refferalOffer = async (req, res) => {

    const data = await refferaldb.find()

    res.render('refferalOffer', { refferal: data })
}

// Add refferal offer
exports.addRefferalOffer = (req, res) => {

    res.render('addRefferal')
}