const express = require('express')
const router = express()

const services = require('../services/userrender')
const controller = require('../controller/user/userController')
const middleman = require('../../middleware/middleman')

// Home page No route Only /
router.get('/',services.slashpage)

// Login page router
router.get('/login',services.login)
router.post('/login',services.login)

// Home page router
router.get('/home',services.home)
// SEARCH // 
// router.post('/search',controller.search)




// Register page router
router.get('/regiter',services.register)
router.post('/regiter',services.register)

// OTP page router
router.get('/otppage',services.otppage)

// Forgot page router
router.get('/forgetpage',services.forgetpage) 

// Reset password page router
router.get('/resetpassword',services.resetpassword)
// update previous Password
router.post('/updatePassword',controller.updatePassword)


// === SINGLE PRODUCT === //
router.get('/home/singleProduct',services.singleProduct)

// === HOME-CATEGORY-PRODUCTS === //
router.get('/home/category/products',services.categoryProducts)

// === USER PROFILE === //
router.get('/home/profile',services.userProfile)


// === ADDRESS MANAGEMENT === //
router.get('/profile/address_management',services.address_management)
// add address 
router.get('/address/add_address',services.add_address)
// Edit address
router.get('/address/edit-address',services.editAddress)
// Delete address
router.get('/address/delete-address',controller.deleteAddress)
// Select one address 
router.get('/address/select-address',controller.selectAddress)
//
router.get('/address/Unselectselect-address',controller.selectedToUnselect)


// === CART ==== // 
router.get('/cart',services.cartPage)
// Add to cart 
router.get('/productAddToCartdb',controller.productAddToCartdb) 
// Delete product from cart
router.get('/deleteCartItem',controller.deleteCartItem)
// cart quantity maintaining 
router.post('/api/updateCartQuantity',controller.updateCartQuantity) 

// === Check out === //
// Check out Page //
router.get('/cart/checkout',services.checkout)
// address change from Check out
router.get('/selectAddressFromCheckout', controller.selectAddressInCheckout);
// Add address in checkout
router.post('/api/add-addressToCheckoutWay',controller.addaddressFromCheckout)
// Apply coupon
router.post('/applyCoupon',controller.applyCoupon)


// === UPDATE PROFILE === //
// change user name
router.get('/profile/updateProfile',services.updateProfile)
// change password 
router.get('/profile/changePassword',services.changePassword)
// old password chacking 
router.post('/api/changePassword',controller.oldPasswordChecking)
// change password from profile After old password page
router.get('/profile/newPasswordUpdation',services.changePasswordFromProfile)
// update After user changed from update profile
router.post('/password/updatePasswordAfterChanged',controller.updatePasswordAfterChanged)


// === ORDER LIST === //
// save Order Data To OrderDb
router.post('/api/orderDataSaveToOrderDb',controller.saveToOrderdb)
// Order Page
router.get('/orderList',services.orderList)
// order success page
router.get('/orderSuccessPage',services.orderSuccessPage)
// cancel Order
router.get('/api/cancelOrder',controller.cancelOrder)


// === WISH LIST === //
router.get('/wishlist',services.wishlist)
// home product to wishlist 
router.get('/home/addToWislist',controller.homeProductToWishlist)
// add to wish list from the single product page 
router.get('/addToWishlistFromSingleProduct',controller.addToWishlistFromSingleProduct)
// Delete wish list from wish list page 
router.get('/deleteWishlistItem',controller.deleteWishListFromWishlistPage)
// Add to cart from wishlist
router.get('/wishlistAddToCartdb',controller.wishlistAddToCartdb)





//api

// router.post('/api/register',middleman.userCheck,controller.register)
router.post('/api/register',controller.register)

//  Otp page to Login page
router.post('/api/otpverify',controller.otpverify)
// Reset Password
router.post('/api/emailForResetPassword',controller.emailForResetPassword)

router.post('/api/h',controller.loginverification)
// ADDRESS //
// Add user address and save to db
router.post('/api/addaddress',controller.saveAddress) 
// submit edited address
router.post('/api/submitEdit_address',controller.updateAddress)

// === Profile updation === // 
router.post('/api/emailForUpdateProfile',controller.updateProfile)


module.exports = router


// router.get('/homey',services.homey)