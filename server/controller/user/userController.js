
const Userdb = require('../../model/userSchema')
const Otpdb = require('../../model/otpSchema')
const nodemailer = require('nodemailer');
const Mailgen = require('mailgen');
const addressdb = require('../../model/addressSchema')
const mongoose = require('mongoose');
const cartdb = require('../../model/cartSchema');
const productdb = require('../../model/productSchema')
const orderdb = require('../../model/orderSchema')
var object = require('mongoose').ObjectId
const coupondb = require('../../model/couponSchema')
const wishlistdb = require('../../model/wishlistSchema')
const walletdb = require('../../model/walletSchema')

const Razorpay = require('razorpay');










// otp
const otpGenerator = () => {
    return `${Math.floor(1000 + Math.random() * 9000)}`;
};

// send mail
const sendOtpMail = async (req, res) => {
    // console.log('ziyad');
    const otp = otpGenerator();
    console.log(otp);

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.AUTH_EMAIL,
            pass: process.env.AUTH_PASS,
        }
    });

    const MailGenerator = new Mailgen({
        theme: 'default',
        product: {
            name: 'Fonkart',
            link: 'https://mailgen.js/',
            logo: 'Fonkart',
        },
    });

    const response = {
        body: {
            name: req.session.userEmail,
            intro: 'Your OTP for Fonekart verification is:',
            table: {
                data: [
                    {
                        otp: otp,
                    },
                ],
            },
            outro: '✅',
        },
    };

    const mail = MailGenerator.generate(response);

    const message = {
        from: process.env.AUTH_EMAIL,
        to: req.session.userEmail,
        subject: 'Fonekart',
        html: mail,
    };

    try {
        const newOtp = new Otpdb({
            email: req.session.userEmail,
            otp: otp,
            createdAt: Date.now(),
            expiresAt: Date.now() + 60000,
        });
        const data = await newOtp.save();
        req.session.otpId = data._id;
        res.status(200).redirect('/otppage');
        await transporter.sendMail(message);
    } catch (err) {
        console.log(err);
    }
};

// OTP VERIFY //
exports.otpverify = async (req, res) => {

    const otp = await Otpdb.findOne({ _id: req.session.otpId })
    // console.log(otp);
    if (req.body.otp === otp.otp) {


        const userData = req.session.userData

        // console.log(userData);


        const data = new Userdb({
            name: userData.name,
            email: userData.email,
            password: userData.password


        })

        await data.save()



        res.redirect('/login')
    }
}

// LOGIN VERIFICATION //
exports.loginverification = async (req, res) => {
    const email = await Userdb.findOne({ email: req.body.email })
    // console.log(email);
    if (email && email.password === req.body.password) {
        if (email.block === true) {

            req.session.message = 'You are blocked'

            // return res.send('You are blocked') 
            return res.redirect('/login')
        }
        req.session.isLogged = true
        req.session.email = email;
        req.session.userId = email._id
        // console.log(req.session.userId);
        res.redirect('/home')
    } else if (req.body.password === email.password) {
        req.session.NotPass = 'Please check your password'
        return res.redirect('/login')
    } else {
        res.redirect('/login')
    }

    // if(req.body.password === email.password){
    //     req.session.NotPass = 'Please check your password'
    //     return res.redirect('/home')
    // }else{
    //     res.redirect('/login')
    // }
}


// Register // 
exports.register = async (req, res) => {


    const userData = await Userdb.findOne({ email: req.body.email });

    if (userData) {

        req.session.message = 'Email already taken, Please enter a different email'

        return res.redirect('/regiter')

        //   return  res.render('register', { message:req.session.message});

    }

    req.session.userData = req.body

    req.session.userEmail = req.body.email
    // req.session.user_id = req.body._id
    req.session.pass = req.body.password
    // console.log(req.body._id);

    await sendOtpMail(req, res)


}

// === RESET PASSWORD FROM LOGIN PAGE === //
// Reset Password //
exports.emailForResetPassword = async (req, res) => {
    try {
        const userEmailForReset = await Userdb.findOne({ email: req.body.email })

        if (userEmailForReset) {
            req.session.emailForChangePassword = req.body.email
            return res.redirect('/resetpassword')
        } else {
            req.session.message = 'Please enter a valid email'
            return res.redirect('/forgetpage')
        }

    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error')
    }
}

// update previous password - [ RESET PASSWORD ] 
exports.updatePassword = async (req, res) => {

    const userExists = await Userdb.findOne({ email: req.session.emailForChangePassword });

    try {

        if (userExists) {

            const passwordUpdation = await Userdb.findOneAndUpdate(
                { email: req.session.emailForChangePassword },
                {
                    $set: {
                        password: req.body.newPassword,
                    },
                }
            );
            // console.log(passwordUpdation);

            res.redirect('/login')
        }
    } catch (error) {
        console.log(error);
    }

}


// SEARCHING -------------------//

// SEARCH -------
// exports.search = async (req, res) => {

//     const searchData = req.body.search.trim();
//     console.log(searchData);

//     try {
//         const data = await productdb.find({ Pname: { $regex: searchData, $options: 'i' } })
//         console.log(data) 
//         res.status(200).json({ products: data })
//     } catch (error) {
//         console.error(error)
//         res.status(500).json({ message: error.message })
//     }
// }


// === USER PROFILE ===//
// = USER ADDRES = //

// save address
exports.saveAddress = async (req, res) => {

    let checkAddress = await addressdb.findOne({ user_Id: req.session.userId })

    if (!checkAddress) {
        checkAddress = new addressdb({
            user_Id: req.session.userId,
            address: [{
                name: req.body.name,
                address: req.body.address,
                phone: req.body.phoneNumber,
                city: req.body.city,
                district: req.body.district,
                pin: req.body.pinCode,

            }]
        })


    } else {
        checkAddress.address.push({
            name: req.body.name,
            address: req.body.address,
            phone: req.body.phoneNumber,
            city: req.body.city,
            district: req.body.district,
            pin: req.body.pinCode,
            defaultAddress: false

        })
    }
    checkAddress.save()
        .then(data => {
            res.redirect('/profile/address_management')
        })
        .catch(err => {
            res.status(400).send({
                message: err.message || "Some error "
            })
        })

}


// edited address update 
exports.updateAddress = async (req, res) => {
    // console.log("siiii");
    const user_Id = req.session.userId
    const queryid = req.query.id

    try {
        const AddressData = await addressdb.aggregate([
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

        // console.log(AddressData);
        const updateAddress = {
            name: req.body.name,
            address: req.body.address,
            phone: req.body.phone,
            city: req.body.city,
            district: req.body.district,
            pin: req.body.pinCode
        }

        const data = await addressdb.updateOne(
            { "user_Id": user_Id, "address._id": queryid },
            {
                $set: {
                    "address.$.name": req.body.name,
                    "address.$.address": req.body.address,
                    "address.$.phone": req.body.phone,
                    "address.$.city": req.body.city,
                    "address.$.district": req.body.district,
                    "address.$.pin": req.body.pinCode
                }
            }
        );

        // console.log(data);
        // console.log(dee)
        res.redirect('/profile/address_management')
    } catch (error) {
        res.send(error)
    }

}

// delete address
exports.deleteAddress = async (req, res) => {

    const user_Id = req.session.userId
    const queryid = req.query.id
    try {
        const data = await addressdb.updateOne(
            { "user_Id": user_Id },
            { $pull: { "address": { "_id": queryid } } }
        );

        // console.log("saaaaiiii",deleteIdpass) 
        res.redirect('/profile/address_management')
    } catch (error) {
        console.log(error);
    }
}

// Select a address 
exports.selectAddress = async (req, res) => {
    try {
        const user_Id = req.session.userId
        // console.log('userId', user_Id);
        const queryid = req.query.id
        console.log(queryid);

        const updateResult = await addressdb.find(
            { "user_Id": user_Id, "address.defaultAddress": false }

        )

        console.log(updateResult)

        const data = await addressdb.updateOne({ "user_Id": user_Id, "address._id": queryid }, { $set: { 'address.$.defaultAddress': false } })

        res.redirect('/profile/address_management')
    } catch (error) {
        console.log(error);
    }
}

// select one address
exports.selectedToUnselect = async (req, res) => {
    try {
        const user_Id = req.session.userId
        // console.log('userId', user_Id)
        const queryid = req.query.id
        const existingAddressDocument = await addressdb.findOne({
            user_Id: user_Id,
        },);

        const selectedIndex = existingAddressDocument.address.findIndex((item) => {
            return (item._id.equals(new mongoose.Types.ObjectId(queryid)))
        });
        existingAddressDocument.address.forEach((item, index) => {
            return (item.defaultAddress) = (index === selectedIndex);
        });
        await existingAddressDocument.save();

        res.redirect('/profile/address_management')
    } catch (error) {
        console.log(error);
    }
}


// = UPDATE PROFILE = //
// Update profile
exports.updateProfile = async (req, res) => {
    try {

        const userId = req.session.email._id
        const userProfileUpdate = await Userdb.updateOne({ _id: userId }, { $set: { name: req.body.name } })
        console.log(userProfileUpdate)
        res.redirect('/home/profile')
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error')
    }
}

// old password checking is same or not 
exports.oldPasswordChecking = async (req, res) => {
    try {
        const userPass = req.session.email.password
        // console.log(userPass)
        const { oldPass } = req.body
        // console.log(oldPass)
        if (oldPass === userPass) {
            return res.redirect('/profile/newPasswordUpdation')
        } else {
            req.session.message = 'Incorrect password'
            return res.redirect('/profile/changePassword')
        }
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error')
    }
}

// update password after changed
exports.updatePasswordAfterChanged = async (req, res) => {
    try {
        const userId = req.session.email._id
        // console.log('user id 1',userId)
        // console.log(req.body.newPassword)
        const findid = await Userdb.updateOne({ _id: userId }, { $set: { password: req.body.newPassword } })
        // console.log('user id 2',findid) 
        res.redirect('/profile/updateProfile')

    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error')
    }
}



// === CART === //
// Save to add to cart // 
exports.productAddToCartdb = async (req, res) => {
    const queryId = req.query.id;
    const userId = req.session.userId;

    try {
        let cart = await cartdb.findOne({ user_id: userId });

        if (!cart) {
            // If the user does not have a cart, create a new one
            cart = new cartdb({
                user_id: userId,
                cartItems: [{ productId: queryId }],
            });
        } else {
            // Check if the product is already in the cart
            const isProductInCart = cart.cartItems.some(item => item.productId.equals(queryId));

            if (!isProductInCart) {
                // If the product is not in the cart, add it
                cart.cartItems.push({ productId: queryId });
            }
        }

        // Save the updated cart
        await cart.save()
        res.redirect('/cart')
    } catch (err) {
        console.error(err);
        res.status(500).send({
            message: "Internal server error",
        })
    }
}

// Delete a product from cart 
exports.deleteCartItem = async (req, res) => {
    try {
        const productId = req.query.id;
        const userId = req.session.userId;


        const deleteCartItem = await cartdb.updateOne(
            { user_id: userId },
            { $pull: { cartItems: { productId: productId } } }
        );

        // Check if any document was modified
        if (deleteCartItem.nModified > 0) {
            // console.log("Product removed from cart successfully")
        } else {
            // console.log("Product not found in the cart")
        }

        // You might want to redirect to the cart page or send a response to the client
        res.redirect('/cart');
    } catch (error) {
        console.error(error);
        // Handle the error, e.g., send an error response to the client
        res.status(500).send({ message: "Internal server error" });
    }
}


// Check out Address change
exports.selectAddressInCheckout = async (req, res) => {
    try {
        console.log(req.query.id); // Access id from query parameters
        const user_Id = req.session.userId;
        const queryid = req.query.id;
        const existingAddressDocument = await addressdb.findOne({
            user_Id: user_Id,
        });
        const selectedIndex = existingAddressDocument.address.findIndex((item) => {
            return item._id.equals(new mongoose.Types.ObjectId(queryid));
        });
        existingAddressDocument.address.forEach((item, index) => {
            item.defaultAddress = index === selectedIndex;
        });
        await existingAddressDocument.save();
        res.redirect('/cart/checkout');
    } catch (error) {
        console.log(error);
    }
};

// Add addrees from the checkout
exports.addaddressFromCheckout = async (req, res) => {
    try {
        let checkAddress = await addressdb.findOne({ user_Id: req.session.userId })

        if (!checkAddress) {
            checkAddress = new addressdb({
                user_Id: req.session.userId,
                address: [{
                    name: req.body.name,
                    address: req.body.address,
                    phone: req.body.phoneNumber,
                    city: req.body.city,
                    district: req.body.district,
                    pin: req.body.pinCode,
                }]
            })
        } else {
            checkAddress.address.push({
                name: req.body.name,
                address: req.body.address,
                phone: req.body.phoneNumber,
                city: req.body.city,
                district: req.body.district,
                pin: req.body.pinCode,
                defaultAddress: false
            })
        }
        const savedAddress = await checkAddress.save();
        res.redirect('/cart/checkout');
    } catch (error) {
        console.error("Error adding address:", error);
        let errorMessage = "An error occurred while adding the address.";

        // Check if the error is a validation error
        if (error.name === 'ValidationError') {
            // Construct a detailed error message based on the validation errors
            errorMessage = Object.values(error.errors).map(err => err.message).join(' ');
        }

        res.status(400).send({
            message: errorMessage
        });
    }
}


// update quantity in cart page when use increasing and decreasing quantity
exports.updateCartQuantity = async (req, res, next) => {
    const userId = req.session.userId;
    const productId = req.query.pid;
    const qty = req.query.qty;
    // console.log(userId,productId,qty);
    try {
        const product = await productdb.findOne({ _id: productId });

        const updateResult = await cartdb.updateOne(
            { user_id: userId, "cartItems.productId": productId },
            { $set: { "cartItems.$.quantity": qty } }
        )
        //   console.log(updateResult);

        // Send a success response
        res.send(true);
    } catch (err) {
        // Handle errors
        next(err);
    }
}





// === ORDERDB SAVING === // 

exports.postingOrder = async (req, res) => {


    const userId = req.session.userId;

    try {

        const [data] = await addressdb.aggregate([
            { $match: { user_Id: new mongoose.Types.ObjectId(userId) } },
            { $unwind: "$address" },
            { $match: { "address.defaultAddress": true } },
            {
                $project: {
                    _id: "$address._id",
                    name: "$address.name",
                    address: "$address.address",
                    district: "$address.district",
                    city: "$address.city",
                    phone: "$address.phone",
                    pin: "$address.pin",
                    userId: "$userId"
                }
            },
        ]);



        const cartProducts = await cartdb.aggregate([
            { $match: { user_id: new mongoose.Types.ObjectId(userId) } },
            { $unwind: '$cartItems' },
            {
                $lookup: {
                    from: 'productdbs',
                    localField: 'cartItems.productId',
                    foreignField: '_id',
                    as: 'productDetails'
                }
            },
            { $unwind: '$productDetails' }
        ])

        console.log(cartProducts);


        let subtotal = cartProducts.reduce((total, item) => {
            return total + parseInt(item.productDetails.price * item.cartItems.quantity);
        }, 0)

        const orderItems = cartProducts.map((element) => {
            return {
                productId: element.cartItems.productId,
                Image: element.productDetails.images[0],
                Pname: element.productDetails.Pname,
                category: element.productDetails.Pcategory,
                price: element.productDetails.price,
                quantity: element.cartItems.quantity,
                color: element.productDetails.color,
                Pmodel: element.productDetails.Pmodel,
            }
        })



        orderItems.forEach(async (element) => {
            await productdb.updateOne(
                { _id: element.productId },
                { $inc: { quantity: -element.quantity } }
            );
        })

        const newOrder = new orderdb({
            user_id: userId,
            orderItems: orderItems,
            address: data,
            paymentMethod: req.body.paymentMethod === "cod" ? "cod" : req.body.paymentMethod === "onlinePayment"
        });

        if (req.body.paymentMethod === "cod") {
            await newOrder.save();
            req.session.newOrder = newOrder;

            await cartdb.updateMany({ user_id: userId }, { $set: { cartItems: [] } })

            req.session.orderSuccessPage = true;
            return res.status(200).json({
                success: true,
                url: "/orderSuccessPage",
                paymentMethod: "cod",
            })
        }


        if (req.body.paymentMethod === "onlinePayment") {

            const razorpayInstance = new Razorpay({
                key_id: process.env.key_id || "rzp_test_inNDLEzjcNEB4V",
                key_secret: process.env.key_secret || "zLiACER7KwWbTAVg8XcylyjE"
            })


            const amount = subtotal * 100;

            const options = {
                amount,
                currency: "INR",
                receipt: "" + newOrder._id,
            };

            const order = await razorpayInstance.orders.create(options);

            req.session.newOrder = newOrder;
            console.log(order);


            return res.status(200).json({
                success: true,
                msg: 'order created',
                key_id: process.env.key_id,
                order: order,
                paymentMethod: "onlinePayment"
            });
        }

    } catch (error) {
        console.log(error);
        return res.status(500).send("Error in Payment")
    }
};

exports.orderSuccessful = async (req, res) => {
    try {

        const userId = req.session.userId;
        const crypto = require("crypto");

        const hmac = crypto.createHmac("sha256", process.env.key_secret);
        hmac.update(
            req.body.razorpay_order_id + "|" + req.body.razorpay_payment_id
        );

        if (hmac.digest("hex") === req.body.razorpay_signature) {
            const newOrder = new orderdb(req.session.newOrder)
            await newOrder.save()

            await cartdb.updateMany({ user_id: userId }, { $set: { cartItems: [] } })

            req.session.orderSucessPage = true;
            return res.status(200).redirect("/orderSuccessPage");
        } else {
            return res.send("Order Failed");
        }
    } catch (err) {
        console.error("order razorpay err", err);
        res.status(500).send("internal server error");
    }
}


// COUPON //
// appy coupon 
exports.applyCoupon = async (req, res) => {

    const user_Id = req.session.userId

    try {

        const userCode = req.body.couponCode

        const coupon = await coupondb.findOne({ Code: userCode });

        if (coupon) {

            if (coupon.status === false) {
                req.session.expiredCoupon = 'Coupon is expired';
                res.redirect('/cart/checkout');
                return;
            }

            const result = await cartdb.aggregate([
                { $match: { user_id: new mongoose.Types.ObjectId(user_Id) } },
                { $unwind: { path: "$cartItems" } },
                {
                    $lookup: {
                        from: 'productdbs',
                        localField: 'cartItems.productId',
                        foreignField: '_id',
                        as: 'productDetails'
                    }
                },
                { $unwind: { path: "$productDetails" } }
            ]);

            const total = result.reduce((accumulator, item) => {
                const price = parseInt(item.productDetails.price);
                const quantity = item.cartItems.quantity;
                const totalPrice = price * quantity;
                return accumulator + totalPrice;
            }, 0);

            // Check if the total amount before discount exceeds the maximum price allowed by the coupon
            if (total >= coupon.MaxPrice) {

                // Apply discount
                const discountedTotal = total - (total * (coupon.Discount / 100))
                req.session.success = 'Coupon applied'
                req.session.total = discountedTotal;
                res.redirect('/cart/checkout');

            } else {

                req.session.maxErr = 'Total price is below the Maximum price';
                res.redirect('/cart/checkout');
            }
        } else {
            req.session.notAvailable = 'Coupon Not Available';
            res.redirect('/cart/checkout');
        }


    } catch (error) {
        console.log(error);
    }

}


// cancel order 
exports.cancelOrder = async (req, res) => {
    try {
        const user_Id = req.session.userId
        const query = req.query.id

        const findAndUpdate = await orderdb.findOneAndUpdate(
            {
                user_id: user_Id,
                'orderItems._id': query
            },
            {
                $set: { 'orderItems.$.orderStatus': 'canceled' }
            },
            {
                new: true
            }
        )

        res.redirect('/orderList')

    } catch (error) {
        console.log(error);
    }
}

// Return
exports.return = async (req, res) => {
    const query = req.query.id;
    const user_Id = req.session.userId;

    try {
        // Find the order and update the order status to 'returned'
        const findAndUpdate = await orderdb.findOneAndUpdate(
            {
                user_id: user_Id,
                'orderItems._id': query
            },
            {
                $set: { 'orderItems.$.orderStatus': 'returned' }
            },
            {
                new: true
            }
        );

        const returnedProduct = findAndUpdate.orderItems.find(item => item._id.toString() === query);
        const returnedProductPrice = returnedProduct.price;

        const userWallet = await walletdb.findOne({ userId: user_Id });

        userWallet.balance += returnedProductPrice;

        userWallet.transactions.push({ amount: returnedProductPrice });

        await userWallet.save();

        res.redirect('/orderList')
    } catch (error) {
        console.error("Error returning product:", error);
        res.status(500).send("Internal Server Error");
    }
};


// Wish list ( Home - Whish list)
exports.homeProductToWishlist = async (req, res) => {
    const queryId = req.query.id;
    const userId = req.session.userId;

    try {
        let whishlist = await wishlistdb.findOne({ user_id: userId });

        if (!whishlist) {

            whishlist = new wishlistdb({
                user_id: userId,
                wishlistItems: [{ productId: queryId }],
            });
        } else {

            const isProductInWishList = whishlist.wishlistItems.some(item => item.productId.equals(queryId));

            if (!isProductInWishList) {

                whishlist.wishlistItems.push({ productId: queryId });
            }
        }

        await whishlist.save()


        req.session.wishlist = whishlist

        res.redirect('/home')
    } catch (err) {
        console.error(err);
        res.status(500).send({
            message: "Internal server error",
        })
    }
}

// add To Wishlist From Single Product Page
exports.addToWishlistFromSingleProduct = async (req, res) => {
    const queryId = req.query.id;

    const userId = req.session.userId;

    try {
        let whishlist = await wishlistdb.findOne({ user_id: userId });

        if (!whishlist) {

            whishlist = new wishlistdb({
                user_id: userId,
                wishlistItems: [{ productId: queryId }],
            });
        } else {

            const isProductInWishList = whishlist.wishlistItems.some(item => item.productId.equals(queryId));

            if (!isProductInWishList) {

                whishlist.wishlistItems.push({ productId: queryId });
            }
        }


        await whishlist.save()


        req.session.wishlist = whishlist

        res.redirect(`/home/singleProduct?id=${queryId}`)
    } catch (err) {
        console.error(err);
        res.status(500).send({
            message: "Internal server error",
        })
    }
}

// Delete wish list from wish list page 
exports.deleteWishListFromWishlistPage = async (req, res) => {
    const userId = req.session.userId;
    const query = req.query.id;

    try {

        const deleteWishlist = await wishlistdb.updateOne(
            { user_id: userId },
            { $pull: { wishlistItems: { productId: query } } }
        )

        res.redirect('/wishlist')
    } catch (error) {

        console.error('Error deleting wishlist item:', error);

        res.status(500).send('Error deleting wishlist item');
    }
}

// Wish list to add to cart
exports.wishlistAddToCartdb = async (req, res) => {
    const queryId = req.query.id;
    const userId = req.session.userId;

    try {
        let cart = await cartdb.findOne({ user_id: userId });

        if (!cart) {

            cart = new cartdb({
                user_id: userId,
                cartItems: [{ productId: queryId }],
            });
        } else {

            const isProductInCart = cart.cartItems.some(item => item.productId.equals(queryId));

            if (!isProductInCart) {

                cart.cartItems.push({ productId: queryId });
            }
        }


        await cart.save()
        res.redirect('/cart')
    } catch (err) {
        console.error(err);
        res.status(500).send({
            message: "Internal server error",
        })
    }
}


// WALLET MONEY //
// add money to wallet
exports.addWalletMoney = async (req, res) => {
    console.log(req.body.amount);
    const razorpayInstance = new Razorpay({
        key_id: process.env.key_id || "rzp_test_inNDLEzjcNEB4V",
        key_secret: process.env.key_secret || "zLiACER7KwWbTAVg8XcylyjE"
    })

    try {
        req.session.walletAmount = req.body.amount;
        const amount = Number(req.body.amount) * 100
        const options = {
            amount: amount,
            currency: "INR",
            receipt: "wallet",
        };

        const wallet = await razorpayInstance.orders.create(options);

        return res.status(200).json({
            success: true,
            msg: 'money sucessfully added',
            key_id: razorpayInstance.key_id,
            wallet: wallet
        })

    } catch (error) {
        console.log(error);
        res.status(500).send("internal server error")
    }
}

exports.addWalletMoneySuccessful = async (req, res) => {
    const userId = req.session.userId
    try {
        const crypto = require("crypto")

        const hmac = crypto.createHmac("sha256", process.env.key_secret);
        hmac.update(
            req.body.razorpay_order_id + "|" + req.body.razorpay_payment_id
        );

        if (hmac.digest("hex") === req.body.razorpay_signature) {
            await walletdb.updateOne({ userId: req.session.userId }, { $inc: { balance: req.session.walletAmount } }, { upsert: true })
            const w = await walletdb.findOneAndUpdate({ userId: req.session.userId },
                {
                    $push: {
                        'transactions': {
                            amount: req.session.walletAmount,
                        }
                    }
                })
            req.session.orderSucessPage = true;
            return res.status(200).redirect("/wallet");
        } else {
            return res.send("adding Failed");
        }
    } catch (err) {
        console.error("add razorpay err", err);
        res.status(500).send("Internal Server Error");
    }
}



