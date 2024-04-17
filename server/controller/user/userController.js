
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
const Razorpay = require('razorpay')
const shortid = require('shortid')
const refferaldb = require('../../model/refferalSchema');
const { Table } = require('pdfkit-table')
const PDFDocument = require('pdfkit');





// otp
const otpGenerator = () => {
    return `${Math.floor(1000 + Math.random() * 9000)}`;
};

// send mail
const sendOtpMail = async (req, res) => {

    const otp = otpGenerator()
    console.log(otp)

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.AUTH_EMAIL,
            pass: process.env.AUTH_PASS,
        }

    });
    // console.log(process.env.AUTH_EMAIL,process.env.AUTH_PASS);
    const MailGenerator = new Mailgen({
        theme: 'default',
        product: {
            name: 'Fonkart',
            link: 'https://mailgen.js/',
            logo: 'Fonekart',

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

    const mail = MailGenerator.generate(response)

    const message = {
        from: process.env.AUTH_EMAIL,
        to: req.session.userEmail,
        subject: "Fonekart - OTP Verification",
        html: mail,
    }

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

        console.log('siyaaaaaaaaaaaaaaaa');
        console.log(err);
        res.status(500).redirect('/500');

    }
}


const resendOtpMail = async (req, res) => { 

    const otp = otpGenerator()
    console.log(otp)

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.AUTH_EMAIL,
            pass: process.env.AUTH_PASS,
        }

    });
    // console.log(process.env.AUTH_EMAIL,process.env.AUTH_PASS);
    const MailGenerator = new Mailgen({
        theme: 'default',
        product: {
            name: 'Fonkart',
            link: 'https://mailgen.js/',
            logo: 'Fonekart',

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

    const mail = MailGenerator.generate(response)

    const message = {
        from: process.env.AUTH_EMAIL,
        to: req.session.userEmail,
        subject: "Fonekart - OTP Verification",
        html: mail,
    }

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

        console.log('siyaaaaaaaaaaaaaaaa');
        console.log(err);
        res.status(500).redirect('/500');

    }
}
// Resend otp 
exports.resendOtp = async (req, res) => {
    await resendOtpMail(req, res);
};




// Register // 
// exports.register = async (req, res) => {
//     try {
//         req.session.userData = req.body;

//         const userData = await Userdb.findOne({ email: req.body.email });

//         if (userData) {
//             req.session.message = 'Email already taken, Please enter a different email';

//             if (req.query.referralCode) {
//                 return res.redirect(`/register?referralCode=${req.query.referralCode}`);
//             }

//             return res.redirect('/register');
//         }

//         // let referralCode = req.query.referralCode;

//         // req.session.referralCode = referralCode;

//         // if (referralCode) {
//             // const userReferral = await Userdb.findOne({ referralCode: referralCode });

//             // if (!userReferral) {
//             //     return res.redirect("/register");
//             // }

//             // const referral = await refferaldb.findOne({ expiredate: { $gte: Date.now() } });

//             // if (!referral) {
//             //     return res.redirect("/register");
//             // }

//             req.session.user = req.body.Email;

//             await sendOtpMail(req, res);

//             return res.redirect("/register");
//         // }

//         req.session.userEmail = req.body.email;
//         // console.log(req.session.userEmail);
//         req.session.pass = req.body.password;

//         await sendOtpMail(req, res);
//     } catch (error) {
//         res.status(500).redirect('/500')
//         res.send(error);
//     }
// };


exports.register = async (req, res) => {
    try {
        req.session.userData = req.body;
        req.session.userEmail = req.body.email
        
        const ref = req.body.referralCode;
        console.log(`Helloooooo ${ref}`); 
        

        const userData = await Userdb.findOne({ email: req.body.email })

        if (userData) {
            req.session.message = 'Email already taken, Please enter a different email'


            if (req.query.referralCode) {
              console.log('hi monuse') 
                return res.redirect(`/register?referralCode=${req.query.referralCode}`)
            }

            return res.redirect('/register');
        }
        
        req.session.userEmail = req.body.email;
        req.session.pass = req.body.password;

        await sendOtpMail(req, res);


        // return res.redirect("/register");
    } catch (error) {

        console.error(error);
        res.status(500).redirect('/500');
    }
};



// OTP VERIFY //
exports.otpverify = async (req, res) => {

    const otp = await Otpdb.findOne({ email: req.session.userEmail });
    // console.log(otp);


    if (req.body.otp === otp.otp) {
        const userData = req.session.userData;

        let referralCode = req.query.refferalCode;


        const user = new Userdb({
            name: userData.name,
            email: userData.email,
            password: userData.password,
            referralCode: shortid.generate(),
        });

        const save = await user.save()

        req.session.authentication = true;
        res.redirect("/login")
    } else {
        req.session.otpValidation = "Your OTP is wrong";
        res.redirect("/otppage")
    }

}

// exports.otpverify = async (req, res) => {

//     try {
//         if (!req.body) {
//             return res.status(400).send({ message: "Enter something" });
//         }

//         const otp = await Otpdb.findOne({ _id: req.session.otpId });
//         if (!otp) {
//             req.session.message = 'OTP Not found'
//         }

//         if (req.body.otp === otp.otp) {
//             const userData = req.session.userData;
//             if (req.session.referralCode) {
//                 const user = new Userdb({
//                     name: userData.name,
//                     email: userData.Email,
//                     password: userData.password,
//                     referralCode: shortid.generate()
//                 });

//                 await user.save();

//                 const walletData = new walletdb({
//                     userId: user._id,
//                 });

//                 await walletData.save();

//                 const referalAmount = await refferaldb.findOne({});

//                 await walletdb.findOneAndUpdate(
//                     { userId: user._id },
//                     {
//                         $inc: { balance: referalAmount.referralAmount },
//                         $push: {
//                             transactionHistory: {
//                                 amount: referalAmount.referralAmount,
//                                 PaymentType: "Credit",
//                             },
//                         },
//                     }
//                 );

//                 const referalUser = await Userdb.findOneAndUpdate(
//                     { referralCode: req.session.referralCode },
//                     { $inc: { referralCount: 1 } },
//                     { upsert: true })


//                 await walletdb.updateOne(
//                     { userId: referalUser._id },
//                     {
//                         $inc: { balance: referalAmount.referredAmount },
//                         $push: {
//                             transactionHistory: {
//                                 amount: referalAmount.referredAmount,
//                                 PaymentType: "Credit",
//                             },
//                         },
//                     }
//                 );

//                 return res.redirect("/login");
//             }

//             const user = new Userdb({
//                 name: userData.name,
//                 email: userData.Email,
//                 password: userData.password,
//                 referralCode: shortid.generate(),
//             });

//             await user.save();

//             const walletData = new walletdb({
//                 userId: user._id,
//             });

//             await walletData.save();

//             res.redirect("/login");
//         } else {
//             req.session.otpValidation = "Verify your otp";
//             res.redirect("/register");
//         }
//     } catch (error) {
//         console.error('Error verifying OTP:', error);
//         res.status(500).send('Internal Server Error');
//     }
// }


// LOGIN VERIFICATION //    
// exports.loginverification = async (req, res) => {

//     const email = await Userdb.findOne({ email: req.body.email })

//     if (email && email.password === req.body.password) {
//         if (email.block === true) {

//             req.session.blockmessage = 'You are blocked'
//             return res.redirect('/login')
//         }
//         req.session.isLogged = true
//         req.session.email = email
//         req.session.userId = email._id

//         await Userdb.findOneAndUpdate({ email: req.session.email.email }, { $set: { status: "Active" } })

//         res.redirect('/home')
//     } else if (req.body.password != email.password) {
//         req.session.NotPass = 'Please check your password'
//         return res.redirect('/login')
//     } else {
//         req.session.register = 'Register'
//         res.redirect('/login')
//     }


// }
exports.loginverification = async (req, res) => {
    try {
        const email = await Userdb.findOne({ email: req.body.email });

        if (!email) {
            req.session.register = 'Register';
            return res.redirect('/login');
        }

        if (email.block) {
            req.session.blockmessage = 'You are blocked';
            return res.redirect('/login');
        }

        if (email.password !== req.body.password) {
            req.session.NotPass = 'Please check your password';
            return res.redirect('/login');
        }

        req.session.isLogged = true;
        req.session.email = email;
        req.session.userId = email._id;

        await Userdb.findOneAndUpdate(
            { email: req.session.email.email },
            { $set: { status: "Active" } }
        );

        res.redirect('/home');
    } catch (error) {
        console.error('Error during login verification:', error);
        req.session.errorMessage = 'An error occurred. Please try again later.';
        res.redirect('/login');
    }
};


// logout      
exports.logout = async (req, res) => {
    try {

        await Userdb.findOneAndUpdate({ email: req.session.email.email }, { $set: { status: "Inactive" } });
        req.session.destroy();
        res.status(200).redirect("/home");
    } catch (error) {
        res.status(500).redirect('/500')
        console.log(error)
    }

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
        res.status(500).redirect('/500')
        console.log(error);

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
        res.status(500).redirect('/500')
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
        res.status(500).redirect('/500')
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
        res.status(500).redirect('/500')
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

        // console.log(updateResult)

        const data = await addressdb.updateOne({ "user_Id": user_Id, "address._id": queryid }, { $set: { 'address.$.defaultAddress': false } })

        res.redirect('/profile/address_management')
    } catch (error) {
        res.status(500).redirect('/500')
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
        res.status(500).redirect('/500')
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
        res.status(500).redirect('/500')
        console.log(error);

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
        res.status(500).redirect('/500')
        console.log(error);

    }
}

// update password after changed
exports.updatePasswordAfterChanged = async (req, res) => {
    try {
        const userId = req.session.email._id

        const findid = await Userdb.updateOne({ _id: userId }, { $set: { password: req.body.newPassword } })
        // console.log('user id 2',findid) 
        res.redirect('/profile/updateProfile')

    } catch (error) {
        res.status(500).redirect('/500')
        console.log(error);

    }
}



// === CART === //
// Save to add to cart // 
exports.productAddToCartdb = async (req, res) => {


    const userId = req.session.userId
    if (typeof userId == 'undefined') {
        return res.redirect('/login')
    }


    const queryId = req.query.id;
    try {
        let cart = await cartdb.findOne({ user_id: userId });

        if (!cart) {
            // If the user does not have a cart, create a new one
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

        // Save the updated cart
        await cart.save()
        res.redirect('/cart')
    } catch (err) {
        res.status(500).redirect('/500')
        console.error(err);

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


        if (deleteCartItem.nModified > 0) {

        } else {

        }


        res.redirect('/cart');
    } catch (error) {
        res.status(500).redirect('/500')
        console.error(error);

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
        res.status(500).redirect('/500')
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
        res.status(500).redirect('/500')
        console.error("Error adding address:", error);
        let errorMessage = "An error occurred while adding the address.";


        if (error.name === 'ValidationError') {

            errorMessage = Object.values(error.errors).map(err => err.message).join(' ');
        }
    }
}


// update quantity in cart page when use increasing and decreasing quantity
exports.updateCartQuantity = async (req, res, next) => {
    const userId = req.session.userId;
    const productId = req.query.pid;
    const qty = req.query.qty;

    try {
        const product = await productdb.findOne({ _id: productId });

        const updateResult = await cartdb.updateOne(
            { user_id: userId, "cartItems.productId": productId },
            { $set: { "cartItems.$.quantity": qty } }
        )

        res.send(true);
    } catch (err) {
        res.status(500).redirect('/500')

        next(err);
    }
}





// === ORDERDB SAVING === // 

exports.postingOrder = async (req, res) => {

    const userId = req.session.userId;


    try {

        const walletInfo = await walletdb.findOne({ userId: userId })


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
        ])

        if (!data) {
            req.session.addressErrorMessage = "Please add an address before placing an order."
            return res.redirect("/addAddressPage")
        }



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

        // console.log(cartProducts);


        var subtotal = cartProducts.reduce((total, item) => {
            return req.session.afterCouponApply ? req.session.afterCouponApply : total + parseInt(item.productDetails.price * item.cartItems.quantity) ||
                req.session.afterCouponApply
        }, 0)

        // console.log('BEFORE ', subtotal)  
        // console.log(req.session.afterCouponApply)

        // if(req.session.afterCouponApply){
        //     subtotal = req.session.afterCouponApply
        //     console.log("now total",subtotal);
        // }


        const orderItems = cartProducts.map((element) => {
            const order = {
                productId: element.cartItems.productId,
                Image: element.productDetails.images[0],
                Pname: element.productDetails.Pname,
                category: element.productDetails.Pcategory,
                price: element.productDetails.price,
                quantity: element.cartItems.quantity,
                color: element.productDetails.color,
                Pmodel: element.productDetails.Pmodel,
            };
            if (req.session.appliedCouponCode) {
                const totalUnitPrice = order.price * order.quantity
                const afterDiscountPrice = Math.round(totalUnitPrice - ((totalUnitPrice * req.session.couponDiscount) / 100))
                order.priceAfterCoupon = afterDiscountPrice
                order.couponCode = req.session.appliedCouponCode
            }
            return order
        });



        orderItems.forEach(async (element) => {
            await productdb.updateOne(
                { _id: element.productId },
                { $inc: { quantity: -element.quantity } }
            );
        })

        const newOrder = new orderdb({
            user_id: userId,
            orderItems: orderItems,
            totalAmount: subtotal,
            address: data,
            paymentMethod: req.body.paymentMethod === "cod" ?
                "cod" : req.body.paymentMethod === "onlinePayment" ?
                    "onlinePayment" : "wallet" ?? "wallet"

        });

        const nr = await newOrder.save()
        // console.log("okkkkkkkkkkkkkkkk", nr)

        if (req.body.paymentMethod === "cod") {
            await newOrder.save();
            req.session.newOrder = newOrder;

            await cartdb.updateMany({ user_id: userId }, { $set: { cartItems: [] } })

            // await orderdb.updateOne(
            //     { _id: newOrder._id },
            //     { $set: { "orderItems.$[].orderStatus": "ordered" } }
            // )
            await orderdb.updateOne(
                { _id: newOrder._id, "orderItems.orderStatus": { $ne: "ordered" } },
                { $set: { "orderItems.$.orderStatus": "ordered" } }
            );

            req.session.orderSuccessPage = true;


            return res.status(200).json({
                success: true,
                url: "/orderSuccessPage",
                paymentMethod: "cod",
            })
        }

        if (req.body.paymentMethod == "wallet") {
            if (walletInfo && walletInfo.balance >= subtotal) {
                await newOrder.save()
                req.session.newOrder = newOrder;

                await cartdb.updateMany({ user_id: userId }, { $set: { cartItems: [] } })

                // await orderdb.updateOne(
                //     { _id: newOrder._id },
                //     { $set: { "orderItems.$[].orderStatus": "ordered" } }
                // )

                await orderdb.updateOne(
                    { _id: newOrder._id, "orderItems.orderStatus": { $ne: "ordered" } },
                    { $set: { "orderItems.$.orderStatus": "ordered" } }
                );

                await walletdb.updateOne({ userId: userId },
                    {
                        $inc: { balance: -(subtotal) },
                        $push: { transactions: { amount: -(subtotal) } }
                    },
                    { upsert: true }
                )

                req.session.orderSuccessPage = true;
                return res.status(200).json({
                    success: true,
                    url: "/orderSuccessPage",
                    paymentMethod: "wallet",
                })
            }
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
        res.status(500).redirect('/500')
        console.log('this is error')
        console.log(error);
    }
};

exports.orderSuccessful = async (req, res) => {
    try {

        const userId = req.session.userId;
        const crypto = require("crypto");

        const hmac = crypto.createHmac("sha256", process.env.key_secret)
        hmac.update(
            req.body.razorpay_order_id + "|" + req.body.razorpay_payment_id
        );

        if (hmac.digest("hex") === req.body.razorpay_signature) {
            const newOrder = new orderdb(req.session.newOrder)

            await cartdb.updateMany({ user_id: userId }, { $set: { cartItems: [] } })
            req.session.orderSucessPage = true;



            await orderdb.updateOne(
                { _id: newOrder._id },
                { $set: { "orderItems.$[].orderStatus": "ordered" } }
            )


            return res.status(200).redirect("/orderSuccessPage");
        } else {
            return res.send("Order Failed");
        }
    } catch (err) {
        res.status(500).redirect('/500')
        console.error("order razorpay err", err);

    }
}

// invoice

function generateInvoiceNumber() {

    return Math.floor(Math.random() * 1000000) + 1;
}

exports.invoiceDownload = async (req, res) => {
    const orderId = req.query.productId;
    try {
        const order = await orderdb.findOne({ _id: orderId });


        const doc = new PDFDocument();

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="invoice.pdf"');

        doc.pipe(res);


        const invoiceNumber = generateInvoiceNumber();

        doc.font('Helvetica').fontSize(24).text('Fonekart', { align: 'center' }).moveDown().moveDown();
        doc.font('Helvetica-Bold').fontSize(24).text('INVOICE', { align: 'start' }).moveDown();


        doc.fontSize(12).text(`Invoice Number: ${invoiceNumber}`, { align: 'start' }).moveDown();
        doc.fontSize(10).text(`Order Date: ${order.orderDate.toDateString()}`, { align: 'start' }).moveDown().moveDown();


        doc.fontSize(12).text('BILLED TO :', { underline: true })
        doc.fontSize(10).text(`Name: ${order.address.name}`)
        doc.fontSize(10).text(`Address: ${order.address.address}, ${order.address.city}, ${order.address.pin}`)

        const tableHeaders = ['Product Name', 'Quantity', 'Unit Price', 'Total Price'];


        const startX = 50;
        const startY = doc.y + 15;
        const cellWidth = 120;


        const headerHeight = 30;
        doc.rect(startX, startY, cellWidth * tableHeaders.length, headerHeight).fillAndStroke('#CCCCCC', '#000000');
        doc.font('Helvetica-Bold').fontSize(10).fillColor('#000000');
        tableHeaders.forEach((header, index) => {
            doc.text(header, startX + (cellWidth * index) + (cellWidth / 2), startY + (headerHeight / 2), { width: cellWidth, align: 'start', valign: 'start' });
        });



        const rowHeight = 50;
        let yPos = startY + headerHeight;
        order.orderItems.forEach((item, rowIndex) => {
            const fillColor = rowIndex % 2 === 0 ? '#FFFFFF' : '#EEEEEE';
            doc.rect(startX, yPos, cellWidth * tableHeaders.length, rowHeight).fillAndStroke(fillColor, '#000000');
            doc.fillColor('#000000');
            doc.font('Helvetica').fontSize(10);
            doc.text(item.Pname || 'N/A', startX + (cellWidth / 2), yPos + (rowHeight / 2), { width: cellWidth, align: 'start', valign: 'start' });
            doc.text(item.quantity.toString(), startX + cellWidth + (cellWidth / 2), yPos + (rowHeight / 2), { width: cellWidth, align: 'start', valign: 'start' });
            doc.text(item.price !== undefined ? item.price.toString() : 'N/A', startX + (cellWidth * 2) + (cellWidth / 2), yPos + (rowHeight / 2), { width: cellWidth, align: 'start', valign: 'start' });
            doc.text((item.price !== undefined && item.quantity !== undefined) ? (item.price * item.quantity).toString() : 'N/A', startX + (cellWidth * 3) + (cellWidth / 2), yPos + (rowHeight / 2), { width: cellWidth, align: 'start', valign: 'start' });
            yPos += rowHeight;
        });

        doc.moveDown(2);

        doc.end();
    } catch (error) {
        res.status(500).redirect('/500')
        console.error("Error generating invoice:", error);

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
            }, 0)

            if (total >= coupon.MaxPrice) {

                req.session.appliedCouponCode = coupon.Code
                const discountedTotal = parseInt(total - (total * (coupon.Discount / 100)))
                req.session.success = 'Coupon applied'
                req.session.afterCouponApply = discountedTotal;

                req.session.couponDiscount = coupon.Discount



                res.redirect('/cart/checkout')
                // res.redirect(`/cart/checkout?afterCouponApply=${discountedTotal}`)
                req.session.afterCouponApply = discountedTotal;


            } else {

                req.session.maxErr = 'Total price is below the Maximum price';
                res.redirect('/cart/checkout');
            }
        } else {
            req.session.notAvailable = 'Coupon Not Available';
            res.redirect('/cart/checkout');
        }


    } catch (error) {
        res.status(500).redirect('/500')
        console.log(error);
    }

}


// cancel order 
// exports.cancelOrder = async (req, res) => {
//     try {
//         const user_Id = req.session.userId;
//         const query = req.query.id;

//         // Find and update the order status to 'canceled'
//         const updatedOrder = await orderdb.findOneAndUpdate(
//             {
//                 user_id: user_Id,
//                 'orderItems._id': query
//             },
//             {
//                 $set: { 'orderItems.$.orderStatus': 'canceled' }
//             },
//             {
//                 new: true
//             }
//         );


//         if (!updatedOrder || !updatedOrder.orderItems) {
//             return res.status(404).json({ message: 'Order not found' });
//         }


//         const canceledOrderItem = updatedOrder.orderItems.find(item => item._id.toString() === query);
//         const productId = canceledOrderItem.productId;

//         const returnedProductPrice = canceledOrderItem.price;

//         const userWallet = await walletdb.findOne({ userId: user_Id });

//         userWallet.balance += returnedProductPrice;

//         userWallet.transactions.push({ amount: returnedProductPrice });

//         await userWallet.save();


//         await productdb.findOneAndUpdate(
//             { _id: productId },
//             { $inc: { quantity: canceledOrderItem.quantity } },
//             { new: true }
//         );

//         res.redirect('/orderList');

//     } catch (error) {
//         res.status(500).redirect('/500')
//         console.error(error);

//     }
// };

exports.cancelOrder = async (req, res) => {
    try {
        const user_Id = req.session.userId;
        const query = req.query.id;

        // Find and update the order status to 'canceled'
        const updatedOrder = await orderdb.findOneAndUpdate(
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
        );

        if (!updatedOrder || !updatedOrder.orderItems) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const canceledOrderItem = updatedOrder.orderItems.find(item => item._id.toString() === query);
        const productId = canceledOrderItem.productId;
        const returnedProductPrice = canceledOrderItem.price;

        let userWallet = await walletdb.findOne({ userId: user_Id });

        if (!userWallet) {
            // If user wallet doesn't exist, create a new one
            userWallet = new walletdb({ userId: user_Id, balance: 0, transactions: [] });
        }

        // Update wallet balance and transactions
        userWallet.balance += returnedProductPrice;
        userWallet.transactions.push({ amount: returnedProductPrice });
        await userWallet.save();

        // Update product quantity
        await productdb.findOneAndUpdate(
            { _id: productId },
            { $inc: { quantity: canceledOrderItem.quantity } },
            { new: true }
        );

        res.redirect('/orderList');
    } catch (error) {
        console.error(error);
        res.status(500).redirect('/500');
    }
};



// Return
exports.return = async (req, res) => {
    const query = req.query.id;
    const user_Id = req.session.userId;
    const reason = req.body.reason;

    try {
        // Find the order and update the order status to 'returned'
        const findAndUpdate = await orderdb.findOneAndUpdate(
            {
                user_id: user_Id,
                'orderItems._id': query
            },
            {
                $set: {
                    "orderItems.$.returnReason": reason,
                    "orderItems.$.orderStatus": "returned"
                }
            },
            { new: true }
        );

        const returnedProduct = findAndUpdate.orderItems.find(item => item._id.toString() === query);
        const returnedProductPrice = returnedProduct.price;
        const productId = returnedProduct.productId;

        await productdb.findOneAndUpdate(
            { _id: productId },
            { $inc: { quantity: returnedProduct.quantity } },
            { new: true }
        );

        const userWallet = await walletdb.findOne({ userId: user_Id });

        userWallet.balance += returnedProductPrice;

        userWallet.transactions.push({ amount: returnedProductPrice });

        await userWallet.save();

        res.redirect('/orderList')
    } catch (error) {
        res.status(500).redirect('/500')
        console.error("Error returning product:", error);

    }
}

// Return reason
// exports.returnReasonSave = async (req, res) => {
//     try {
//         const orderId = req.query.id;
//         const reason = req.body.reason;

//         const updatedOrder = await orderdb.findOneAndUpdate(
//             { "orderItems._id": orderId },
//             {
//                 $set: {
//                     "orderItems.$.returnReason": reason,
//                     "orderItems.$.orderStatus": "returned"
//                 }
//             },
//             { new: true }
//         )


//         const returnedOrderItem = updatedOrder.orderItems.find(item => item._id.toString() === orderId);
//         const productId = returnedOrderItem.productId;


//         await productdb.findOneAndUpdate(
//             { _id: productId },
//             { $inc: { quantity: returnedOrderItem.quantity } },
//             { new: true }
//         );


//         res.redirect('/orderList');
//     } catch (error) {
//         console.error('Error saving return reason:', error);
//         res.status(500).json({ message: 'Internal server error' });
//     }
// };

// Retry Payment
exports.retryPayment = async (req, res) => {
    const queryPaymentMethod = req.body.paymentMethod;
    const queryOrderId = req.body.orderId;

    try {
        if (queryPaymentMethod === "cod") {
            console.log("yes enetring");
            const orderFind = await orderdb.findById(queryOrderId)
            function updateOrderStatus(originalOrder, newStatus) {
                originalOrder.orderItems.forEach((item) => {
                    item.orderStatus = newStatus;
                });
            }

            updateOrderStatus(orderFind, "ordered")
            const ko = await orderFind.save();


            // console.log("dfsfsfsfsdfssf",ko);
            await cartdb.updateOne(
                { userId: req.session.email },
                { $set: { products: [] } }
            );
            req.session.orderSuccessPage = true;
            return res.status(200).json({
                success: true,
                url: "/orderSuccessPage",
                paymentMethod: "cod",
            });
        }


        if (req.body.paymentMethod === "wallet") {
            if (walletInfo && walletInfo.balance >= subtotal) {
                await newOrder.save();
                req.session.newOrder = newOrder;
                delete req.session.totalPrice;
                await cartdb.updateOne(
                    { userId: req.session.email },
                    { $set: { products: [] } }
                );
                await walletdb.updateOne(
                    { userId: req.session.email },
                    {
                        $inc: { balance: -(subtotal) },
                        $push: { transactions: { amount: -(subtotal) } }
                    },
                    { upsert: true }
                );
                req.session.orderSucessPage = true;
                res.json({
                    success: true,
                    paymentMethod: "wallet",
                    url: "/orderPlaced",
                });
            }
        }


        if (queryPaymentMethod === "online") {
            // console.log("yes enetring");
            const orderFind = await orderdb.findById(queryOrderId)
            const razorpayInstance = new Razorpay({
                key_id: process.env.key_id || "rzp_test_inNDLEzjcNEB4V",
                key_secret: process.env.key_secret || "zLiACER7KwWbTAVg8XcylyjE"
            })
            const amount = orderFind.totalAmount * 100;

            const options = {
                amount,
                currency: "INR",
                receipt: "" + orderFind._id,
            };

            const order = await razorpayInstance.orders.create(options);

            // req.session.newOrder = newOrder;
            // console.log(order);


            return res.status(200).json({
                success: true,
                msg: 'order created',
                key_id: process.env.key_id || "rzp_test_inNDLEzjcNEB4V",
                order: order,
                paymentMethod: "onlinePayment"
            });


        }

    } catch (error) {
        console.log(error);
        res.status(500).redirect('/500');
    }
}



// WISHLIST // 
// Wish list ( Home - Whish list)
exports.homeProductToWishlist = async (req, res) => {

    const userId = req.session.userId
    if (typeof userId == 'undefined') {
        return res.redirect('/login')
    }

    const queryId = req.query.id;

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
        res.status(500).redirect('/500')
        console.error(err);

    }
}

// add To Wishlist From Single Product Page
exports.addToWishlistFromSingleProduct = async (req, res) => {

    const userId = req.session.userId
    if (typeof userId == 'undefined') {
        return res.redirect('/login')
    }

    const queryId = req.query.id;

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
        res.status(500).redirect('/500')
        console.error(err);

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
        res.status(500).redirect('/500')
        console.error('Error deleting wishlist item:', error);
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
        res.status(500).redirect('/500')
        console.error(err);
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
        res.status(500).redirect('/500')
        console.log(error);
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
        res.status(500).redirect('/500')
        console.error("add razorpay err", err);
    }
}


// Filter 

