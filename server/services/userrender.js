
const categorydb = require('../model/categorySchema')
const productdb = require('../model/productSchema')
const userdb = require('../model/userSchema')
const addressdb = require('../model/addressSchema')
const cartdb = require('../model/cartSchema')
const mongoose = require('mongoose')
const orderdb = require('../model/orderSchema')
const wishlistdb = require('../model/wishlistSchema')
const offerdb = require('../model/offerSchema')
const refferaldb = require('../model/refferalSchema')
const walletdb = require('../model/walletSchema')

// Slash page (Only /)
exports.slashpage = async (req, res) => {
    try {
        const productDetails = await productdb.find({ delete: false })
        const categoryDetails = await categorydb.find({ delete: false })

        res.render('home', { product: productDetails, category: categoryDetails, isLogged: req.session.isLogged })
    } catch (err) {
        res.status(500).redirect('/500')
        console.error(err);
        
    }
}

// 500 page 
exports.errorPage = (req,res) => {
    res.render('500page')
}

// Login Page
exports.login = (req, res) => {
    const message = req.session.NotPass;
    const block = req.session.blockmessage
    res.render('login', { blockMsg: block, message: message }, (err, html) => {
        if (err) {
            res.status(500).send(err)
        } else {
            delete req.session.NotPass
            delete req.session.blockmessage
            res.send(html)
        }
    });
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
    const otpmsg = req.session.message
    res.render('otppage', { otpmessage: otpmsg })
}

// Forgot page 
exports.forgetpage = (req, res) => {
    try {
        res.render('forgetpage', { message: req.session.message })
    } catch (error) {

        res.status(500).redirect('/500')
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
        const productDetails = await productdb.aggregate([
            { $match: { delete: false } },
            {
                $lookup: {
                    from: 'offers',
                    localField: 'offerId',
                    foreignField: '_id',
                    as: 'offerDetails'
                }
            }
        ])

        const categoryDetails = await categorydb.aggregate([
            { $match: { delete: false } },
            {
                $lookup: {
                    from: 'offers',
                    localField: 'offerId',
                    foreignField: '_id',
                    as: 'offerDetails'
                }
            }
        ])

        // const categoryDetails = await categorydb.find({ delete: false })

        res.render('home', { product: productDetails, category: categoryDetails, isLogged: req.session.isLogged })
    } catch (error) {
        res.status(500).redirect('/500')
        console.log(error);
    }

}



// === SINGLE PRODUCT PAGE === //
exports.singleProduct = async (req, res) => {
    try {

        const wishlistFromSession = req.session.wishlist;
        const query = req.query.id

        const [singleProduct] = await productdb.aggregate([
            { $match: { _id: new mongoose.Types.ObjectId(query) } },
            {
                $lookup: {
                    from: 'offers',
                    localField: 'offerId',
                    foreignField: '_id',
                    as: 'offerDetails'
                }
            }
        ])


        res.render('singleProductPage', { single: singleProduct, wishlist: wishlistFromSession })

    } catch (error) {
        res.status(500).redirect('/500')
        console.log(error);
        
    }
}

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
        const category = await categorydb.find({ delete: false });

        const cat = req.query.cat;
        const min = req.query.minPrice;
        const max = req.query.maxPrice;
        const sort = req.query.sort;

        if (req.query.search) {
            req.session.search = req.query.search
            products = await productdb.find({ Pname: { $regex: req.query.search, $options: 'i' } });
        } else if (cat) {
            let query = { delete: false, Pcategory: cat };

            if (min && max) {
                query.price = { $gte: min, $lte: max };
            }
            products = await productdb.aggregate([
                { $match: query },
                {
                    $lookup: {
                        from: 'offers',
                        localField: 'offerId',
                        foreignField: '_id',
                        as: 'offerDetails'
                    }
                }
            ]);

            if (sort) {
                if (sort === 'highToLow') {
                    products.sort((a, b) => b.price - a.price)
                } else if (sort === 'lowToHigh') {
                    products.sort((a, b) => a.price - b.price)
                }
            }
        }

        if (cat === 'Allproducts') {
            products = await productdb.aggregate([
                { $match: { delete: false } },
                {
                    $lookup: {
                        from: 'offers',
                        localField: 'offerId',
                        foreignField: '_id',
                        as: 'offerDetails'
                    }
                }
            ]);
        }
        if (sort) {
            if (sort === 'highToLow') {
                products.sort((a, b) => b.price - a.price)
            } else if (sort === 'lowToHigh') {
                products.sort((a, b) => a.price - b.price)
            }
        }

        if (req.query.category) {
            products = await productdb.aggregate([
                { $match: { delete: false, Pcategory: req.query.category } },
                {
                    $lookup: {
                        from: 'offers',
                        localField: 'offerId',
                        foreignField: '_id',
                        as: 'offerDetails'
                    }
                }
            ]);
        }

        res.render('productList', { productList: products, categoryData: category });
    } catch (error) {
        res.status(500).redirect('/500')
        console.error(error);
       
    }
};


// exports.categoryProducts = async (req, res) => {
//     try {
//         let products;
//         const category = await categorydb.find({ delete: false });

//         const cat = req.query.cat;
//         const min = req.query.minPrice;
//         const max = req.query.maxPrice;
//         const sort = req.query.sort;
//         // const page = parseInt(req.query.page) || 1;
//         // const limit = 10; // Adjust the limit as needed

//         if (req.query.search) {
//             products = await productdb.find({ Pname: { $regex: req.query.search, $options: 'i' } });
//         } else if (cat) {
//             let query = { delete: false, Pcategory: cat };

//             if (min && max) {
//                 query.price = { $gte: min, $lte: max };
//             }

//             products = await productdb.aggregate([
//                 { $match: query },
//                 {
//                     $lookup: {
//                         from: 'offers',
//                         localField: 'offerId',
//                         foreignField: '_id',
//                         as: 'offerDetails'
//                     }
//                 }
//             ]);

//             if (sort) {
//                 if (sort === 'highToLow') {
//                     products.sort((a, b) => b.price - a.price)
//                 } else if (sort === 'lowToHigh') {
//                     products.sort((a, b) => a.price - b.price)
//                 }
//             }
//         }

//         if (cat === 'Allproducts') {
//             products = await productdb.aggregate([
//                 { $match: { delete: false} },
//                 {
//                     $lookup: {
//                         from: 'offers',
//                         localField: 'offerId',
//                         foreignField: '_id',
//                         as: 'offerDetails'
//                     }
//                 }
//             ]);
//         }

//         if (sort) {
//             if (sort === 'highToLow') {
//                 products.sort((a, b) => b.price - a.price)
//             } else if (sort === 'lowToHigh') {
//                 products.sort((a, b) => a.price - b.price)
//             }
//         }

//         if (req.query.category) {
//             products = await productdb.aggregate([
//                 { $match: { delete: false, Pcategory: req.query.category } },
//                 {
//                     $lookup: {
//                         from: 'offers',
//                         localField: 'offerId',
//                         foreignField: '_id',
//                         as: 'offerDetails'
//                     }
//                 }
//             ]);
//         }

//         // const totalCount = products.length;
//         // const totalPages = Math.ceil(totalCount / limit);
//         // const currentPage = Math.min(page, totalPages);
//         // const startIndex = (currentPage - 1) * limit;
//         // const itemsOnPage = products.slice(startIndex, startIndex + limit);

//         res.render('productList', { productList: itemsOnPage, categoryData: category });
//         // res.render('productList', { productList: itemsOnPage, categoryData: category, pageNumbers: pageNumbers });

//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: error.message });
//     }
// };




// === USER PROFILE === // 
// user profile


exports.userProfile = async (req, res) => {

    const userId = req.session.userId
    if (typeof userId == 'undefined') {
        return res.redirect('/login')
    }


    try {
        const referalOffer = await refferaldb.find()

        const data = await userdb.findOne({ _id: req.session.email })
        res.render('userProfile', { userData: data, referalOffer: referalOffer })
    } catch (error) {

        res.status(500).redirect('/500')
        console.log(error);
    }
}

// Update profile
exports.updateProfile = async (req, res) => {

    try {
        const data = await userdb.findOne({ _id: req.session.email })
        res.render('updateProfile', { userData: data })
    } catch (error) {
        res.status(500).redirect('/500')
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
        res.status(500).redirect('/500')
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
        res.status(500).redirect('/500')
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
        res.status(500).redirect('/500')
        console.log(error);
    }

}


// === CART === // 

exports.cartPage = async (req, res) => {

    const userId = req.session.userId
    if (typeof userId == 'undefined') {
        return res.redirect('/login')
    }


    const user_Id = req.session.userId
    const queryid = req.query.id

    try {


        const userCart = await cartdb.aggregate([
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
            },
            {
                $lookup: {
                    from: 'offers',
                    localField: 'productDetails.offerId',
                    foreignField: '_id',
                    as: 'offerDetails'
                }
            }
        ]);


        res.render('cart', { cartData: userCart });

    } catch (error) {
        res.status(500).redirect('/500')
        console.log(error)
    }
}


// Check out page 
exports.checkout = async (req, res) => {
    const user_Id = req.session.userId
    const queryid = req.query.id

    const TotalPriceChangeUsingCoupon = req.session.afterCouponApply
    const maxError = req.session.maxErr
    const notAvailableCoupon = req.session.notAvailable
    const success = req.session.success
    const expired = req.session.expiredCoupon
    const address = req.session.addressErrorMessage

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
            },
            {
                $lookup: {
                    from: 'offers',
                    localField: 'productDetails.offerId',
                    foreignField: '_id',
                    as: 'offerDetails'
                }
            }
        ]);


        const wallet = await walletdb.findOne({ userId: user_Id })


        const addressData = await addressdb.findOne({ user_Id: user_Id })

        res.render('checkout', {
            Checkout: checkoutData,
            addressSelect: addressData,
            address: address,
            walletInfo: wallet,
            totalUsingCoupon: TotalPriceChangeUsingCoupon,
            maxError: maxError,
            notAvailable: notAvailableCoupon,
            success: success,
            expired: expired
        }, (err, html) => {
            if (err) {
                console.log(err);
                return res.status(500).send(err)
            }
            delete req.session.total;
            delete req.session.maxErr;
            delete req.session.notAvailable;
            delete req.session.success;
            delete req.session.expiredCoupon
            delete req.session.afterCouponApply
            res.status(200).send(html)
        });



    } catch (error) {
        res.status(500).redirect('/500')
        console.log(error)
    }
}


// === ORDERED PRODUCTS LIST === //
// order list page 
exports.orderList = async (req, res) => {
    try {

        const user_Id = req.session.userId
    if (typeof user_Id == 'undefined') {
        return res.redirect('/login')
    }
        
        const page = req.query.page || 1;
        const limit = 5;


        const orderData = await orderdb.aggregate([
            {
                $match: { user_id: new mongoose.Types.ObjectId(user_Id) }
            },
            {
                $sort: { 'orderDate': -1 }
            },
            {
                $unwind: '$orderItems'
            },
            {
                $skip: limit * (page - 1)
            },
            {
                $limit: limit
            }
        ])




        const totalOrders = await orderdb.aggregate([
            {
                $match: { user_id: new mongoose.Types.ObjectId(user_Id) }
            },
            {
                $group: {
                    _id: null,
                    count: { $sum: 1 }
                }
            }
        ]);


        const totalCount = totalOrders.length > 0 ? totalOrders[0].count : 0;


        const totalPages = Math.ceil(totalCount / limit);


        res.render('orderListPageUser', { OrderData: orderData, totalPages: totalPages });
    } catch (error) {
        res.status(500).redirect('/500')
        console.error(error);
    }
}

// ORDER SUCCESS PAGE //
exports.orderSuccessPage = (req, res) => {
    res.render('orderSuccess')
}

// order detail page 
exports.orderDetailPage = async (req, res) => {
    const productId = req.query.id;
    const userId = req.session.userId;

    try {

        const order = await orderdb.findOne({ _id: productId })

        res.render('orderDetailPage', { order: order });

    } catch (error) {
        res.status(500).redirect('/500')
        console.error("Error finding order:", error);
       
    }
}






// === WISHL LIST === //
exports.wishlist = async (req, res) => {

    const user_Id = req.session.userId;
    if (typeof user_Id == 'undefined') {
        return res.redirect('/login')
    }


    const queryid = req.query.id;
    const page = req.query.page || 1;
    const limit = 5

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
            },
            {
                $lookup: {
                    from: 'offers',
                    localField: 'WishlistDetails.offerId',
                    foreignField: '_id',
                    as: 'offerDetails'
                }
            }
        ]);



        const totalCount = userWishlist.length;

        const totalPages = Math.ceil(totalCount / limit);

        const currentPage = Math.min(page, totalPages);

        const startIndex = (currentPage - 1) * limit;

        const itemsOnPage = userWishlist.slice(startIndex, startIndex + limit);

        res.render('wishlist', {
            wishlistData: itemsOnPage,
            currentPage: currentPage,
            totalPages: totalPages
        });
    } catch (error) {
        res.status(500).redirect('/500')
        console.log(error);
    }
}


// WALLET =====//
exports.wallet = async (req, res) => {
    try {
        const user_Id = req.session.userId;
        if (typeof user_Id == 'undefined') {
            return res.redirect('/login')
        }

        const userId = req.session.userId
        const wallet = await walletdb.findOne({ userId: userId })
        res.render('wallet', { walletInfo: wallet })
    } catch (error) {
        res.status(500).redirect('/500')
        console.log(error)
       
    }
}


// exports.razorpay = async(req,res) => {
//     await res.render('razorpay_payment_page')
// }







