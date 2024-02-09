
const categorydb = require('../model/categorySchema')
const productdb = require('../model/productSchema')
const userdb = require('../model/userSchema')
const addressdb = require('../model/addressSchema')
const cartdb = require('../model/cartSchema')
const mongoose = require('mongoose')
const orderdb = require('../model/orderSchema')
const wishlistdb = require('../model/wishlistSchema')


// Slash page (Only /)
exports.slashpage = async (req, res) => {
    try {
        const productDetails = await productdb.find({ delete: false })
        const categoryDetails = await categorydb.find({ delete: false })
        // console.log(productDetails);
        res.render('home', { product: productDetails, category: categoryDetails, isLogged: req.session.isLogged })
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal server err');
    }
}

// Login Page
exports.login = (req, res) => {
    res.render('login', { message: req.session.message }, (err, hii) => {
        if (err) {
            res.send(err)
        }
        delete req.session.message

        res.send(hii)
    })
}

// Reegistration page
exports.register = (req, res) => {
    res.render('register', { message: req.session.message }, (err, html) => {
        if (err) {
            res.send(err)
        }

        delete req.session.message

        res.send(html)
    })
}

// OTP page
exports.otppage = (req, res) => {
    res.render('otppage')
}

// Forgot page
exports.forgetpage = (req, res) => {
    try {
        res.render('forgetpage', { message: req.session.message })
    } catch (error) {
        console.log(error);
    }

}

// Reset password page
exports.resetpassword = (req, res) => {
    res.render('resetpassword')
}


// Home page
exports.home = async (req, res) => {
    try {
        const productDetails = await productdb.find({ delete: false })
        // console.log(productDetails);
        const categoryDetails = await categorydb.find({ delete: false })
        // console.log(productDetails);
        res.render('home', { product: productDetails, category: categoryDetails, isLogged: req.session.isLogged })
    } catch (error) {
        console.log(error);
    }

}



// === SINGLE PRODUCT PAGE === //
exports.singleProduct = async (req, res) => {
    try {
        // Retrieve wishlist from session
        const wishlistFromSession = req.session.wishlist;

        // Retrieve product details for the single product
        const singleProduct = await productdb.findOne({ _id: req.query.id });

        // Pass wishlist and product details to the EJS template
        res.render('singleProductPage', { single: singleProduct, wishlist: wishlistFromSession });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            message: "Internal server error",
        });
    }
};

// === PRODUCT LIST === //
// exports.categoryProducts = async (req, res) => {
//     try {
//         const passCategoryName = await productdb.find({ Pcategory: req.query.category })
//         res.render('productList', { productList: passCategoryName })
//     } catch (error) {
//         console.log(error);
//     }
// }

exports.categoryProducts = async (req, res) => {
    try {
        let products;

        if (req.query.search) {
            products = await productdb.find({ Pname: { $regex: req.query.search, $options: 'i' } });
        } else {
            products = await productdb.find({ Pcategory: req.query.category });
        }

        res.render('productList', { productList: products });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
}



// === USER PROFILE === // 
// user profile
exports.userProfile = async (req, res) => {

    try {
        const data = await userdb.findOne({ _id: req.session.email })
        res.render('userProfile', { userData: data })
    } catch (error) {
        console.log(error);
    }
}

// Update profile
exports.updateProfile = async (req, res) => {
    try {
        const data = await userdb.findOne({ _id: req.session.email })
        res.render('updateProfile', { userData: data })
    } catch (error) {

    }

}

// Old Password
exports.changePassword = async (req, res) => {
    try {
        res.render('changePassword', { message: req.session.message }, (err, html) => {
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

// change password from profile After old password page 
exports.changePasswordFromProfile = (req, res) => {
    res.render('changePasswordFromProfile')
}


// PROFILE / ADDRESS MANAGEMENT ======================================================== //

exports.address_management = async (req, res) => {

    // console.log(req.session.userId)
    try {
        const addressData = await addressdb.find({ user_Id: req.session.userId })
        // console.log(addressData) 
        res.render('userAddress', { address: addressData })
    } catch (error) {
        console.log(error);
    }
}

// Add address 
exports.add_address = (req, res) => {
    res.render('addAddress')
}

// Edit address
exports.editAddress = async (req, res) => {

    const user_Id = req.session.userId

    const queryid = req.query.id

    try {
        const addressIdpass = await addressdb.aggregate([
            {
                $match: { user_Id: new mongoose.Types.ObjectId(user_Id) }
            },
            {
                $unwind: '$address'
            },
            {
                $match: { 'address._id': new mongoose.Types.ObjectId(queryid) }
            }
        ])

        // console.log(addressIdpass);


        res.render('editaddress', { editAddress: addressIdpass })
    } catch (error) {
        console.log(error);
    }

}


// === CART === // 

exports.cartPage = async (req, res) => {

    const user_Id = req.session.userId
    const queryid = req.query.id

    try {

        let userCart = await cartdb.aggregate([
            {
                $match: { user_id: new mongoose.Types.ObjectId(user_Id) }
            },
            {
                $unwind: '$cartItems'
            },
            {
                $lookup: {
                    from: 'productdbs',
                    localField: 'cartItems.productId',
                    foreignField: '_id',
                    as: 'productDetails'
                }
            }
        ])

        res.render('cart', { cartData: userCart })
    } catch (error) {
        console.log(error);
    }
}


// Check out page 
exports.checkout = async (req, res) => {
    const user_Id = req.session.userId
    const queryid = req.query.id

    const TotalPriceChangeUsingCoupon = req.session.total
    const maxError = req.session.maxErr
    const notAvailableCoupon = req.session.notAvailable
    const success = req.session.success

    try {

        let checkoutData = await cartdb.aggregate([
            {
                $match: { user_id: new mongoose.Types.ObjectId(user_Id) }
            },
            {
                $unwind: '$cartItems'
            },
            {
                $lookup: {
                    from: 'productdbs',
                    localField: 'cartItems.productId',
                    foreignField: '_id',
                    as: 'productDetails'
                }
            }
        ])
        // console.log('siyaaad', checkoutData);


        const addressData = await addressdb.findOne({ user_Id: user_Id, 'address.defaultAddress': true })

        // console.log('shahaaaaam',addressData);

        res.render('checkout', {
            Checkout: checkoutData,
            addressSelect: addressData,
            totalUsingCoupon: TotalPriceChangeUsingCoupon,
            maxError: maxError,
            notAvailable: notAvailableCoupon,
            success: success
        }, (err, html) => {
            if (err) {
                return res.status(500).send(err)
            }

            // Clear session variables
            delete req.session.total;
            delete req.session.maxErr;
            delete req.session.notAvailable;
            delete req.session.success;

            res.status(200).send(html)
        });



    } catch (error) {
        console.log(error)
    }
}


// === ORDERED PRODUCTS LIST === //
// order list page 
exports.orderList = async (req, res) => {
    try {

        const user_Id = req.session.userId
        // console.log(user_Id);

        const orderData = await orderdb.aggregate([
            {
                $match: { user_id: new mongoose.Types.ObjectId(user_Id) }
            },
            {
                $unwind: '$orderItems'
            }
        ])
        // console.log(orderData);
        res.render('orderListPageUser', { OrderData: orderData })
    } catch (error) {

    }
}

// ORDER SUCCESS PAGE //
exports.orderSuccessPage = (req, res) => {
    res.render('orderSuccess')
}



// === WISHL LIST === //
exports.wishlist = async (req,res) => {

    const user_Id = req.session.userId
    const queryid = req.query.id
    
    try {

        let userWishlist = await wishlistdb.aggregate([
            {
                $match: { user_id: new mongoose.Types.ObjectId(user_Id) }
            },
            {
                $unwind: '$wishlistItems'
            },
            {
                $lookup: {
                    from: 'productdbs',  
                    localField: 'wishlistItems.productId',
                    foreignField: '_id',
                    as: 'WishlistDetails'
                }
            }
        ]);
        
        // console.log('dddddddddddddddddddddddd',userWishlist);

        res.render('wishlist', { wishlistData: userWishlist })
    } catch (error) {
        console.log(error);
    }
}









