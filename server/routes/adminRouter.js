

const express = require('express')
const adminRouter = express()
const services = require('../services/adminRender')
const controller = require('../controller/admin/adminController')
const store = require('../controller/admin/multer')


// login page 
adminRouter.get('/adminlogin',services.login)

// home page 
adminRouter.get('/adminhome',services.home)

// SALES REPORT
// daily
adminRouter.get('/dailyReportDownload',controller.dailyReport)
// weekly
adminRouter.get('/weeklyReportDownload',controller.weeklyReport)
// yearly 
adminRouter.get('/yearlyReportDownload',controller.yearlyReport)


// PRODUCT MANAGEMENT--------------------------------------------------------------------
// Product management page
adminRouter.get('/product_management',services.product_management)
// Add product page
adminRouter.get('/product/add-product',services.add_product)
// Edit product page
adminRouter.get('/product/edit-product',services.edit_product)
// delete products 
adminRouter.get('/product/delete-product',services.deleteToUnlist) 
// PRODUCT API
// add product
adminRouter.post('/api/addproduct',store.array('file',4),controller.add_product) 
// submit edited product details
adminRouter.post('/api/submitEdit_product',store.array('file',4),controller.submitEdit_product)
// delete product
adminRouter.get('/product/delete-products',controller.deleteproduct)
// Unlist to product
adminRouter.get('/unlistToProduct',controller.unlistToProduct)


// User_management page
adminRouter.get('/User_management',services.User_management)



// Order_management page
adminRouter.get('/Order_management',services.Order_management)


// CATEGORY MANAGEMENT------------------------------------------------------------------
// Categary_management
adminRouter.get('/Categary_management',services.Categary_management)
// Add-category page
adminRouter.get('/category/add-category',services.add_category) 
// Edit category
adminRouter.get('/category/edit-category',services.edit_category)
// Delete category
adminRouter.get('/category/unlisted-category',services.deletecategory)


// COUPON MANAGEMENT ---------------------------------------------------------------------
// Coupon_management
adminRouter.get('/Coupon_management',services.Coupon_management)
// add coupon page 
adminRouter.get('/addCoupon',services.addCoupon)
// Save add coupon data to db
adminRouter.post('/saveToCouponDb',controller.saveToCouponDb)
// Delete coupon
adminRouter.get('/deleteCoupon',controller.deleteCoupon)
// Edit Coupon Page
adminRouter.get('/EditCoupon',services.editCoupon)
// Save Editted Coupon
adminRouter.post('/api/EditCoupon',controller.submitEditedCoupon)


// OFFER MANAGEMENT ----------------------------------------------------------------------
adminRouter.get('/Offer_management',services.Offer_management)
// add category offer
adminRouter.get('/addCategoryOffer',services.addCategoryOffer) 
// Save category offer 
adminRouter.post('/saveToOfferOfCategory',controller.saveToOfferOfCategory)
// Add product offer
adminRouter.get('/addProductOffer',services.productOffer)
// save product offer
adminRouter.post('/saveProductOffer',controller.saveToOfferOfProduct)
// Delete offer
adminRouter.get('/deleteOffer',controller.deleteOffer)

// === REFFEREL OFFER === //
// refferal offer page admin
adminRouter.get('/refferalOffer',services.refferalOffer)



// api 

// login page verification
adminRouter.post('/api/adminlogin',controller.verifylogin)

// CATEGORY
// Add category file upload
adminRouter.post('/api/addcategory',store.array('file',1),controller.categoryAdd)
// edit category
// adminRouter.post('/api/editcategory',controller.edit_category)
// update edited category deteils 
adminRouter.post('/api/submitEdit_category',store.array('file',1),controller.submitEdit_category) 
// delete a category
adminRouter.get('/category/delete-category',controller.deletecategory)
// Unlist to category
adminRouter.get('/unlistToCategory',controller.unlistToCategory)




// ORDER STATUS UPDATION
adminRouter.post('/api/updateOrderStatus',controller.updateOrderStatus)




//  BLOCK UNBLOCK ===============

// adminRouter.post('/adminlogin',services.login)

adminRouter.post('/adminUserStatus/block',controller.blockUser)
adminRouter.post('/adminUserStatus/unblock',controller.unblockUser)  




// axios

// adminRouter.get('/admin/findUserManagment',controller.findUser)



module.exports = adminRouter
