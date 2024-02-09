
// user-schema
const Userdb = require('../../model/userSchema')

// category schema
const categorydb = require('../../model/categorySchema')

// product schema
const productdb = require('../../model/productSchema')

// Multer 
const multer = require('./multer')

// order schema 
const orderdb = require('../../model/orderSchema')

// coupon schema
const coupondb = require('../../model/couponSchema')
const { default: mongoose } = require('mongoose')


// admin login
exports.verifylogin = (req, res) => {
    const a = {
        name: 'admin',
        password: '123'
    }

    if (req.body.username === a.name && req.body.password === a.password) {
        return res.redirect('/adminhome')

    }

}

// PRODUCT MANAGEMENT...............................................................
// add product
exports.add_product = async (req, res) => {
    if (!req.body) {
        res.status(400).send('Enter anything')
        return
    }

    const productName = req.body.Pname

    const productData = await productdb.findOne({ Pname: productName })
    if (productData !== null) {
        req.session.productError = 'Already used this product'
        return res.redirect('/product_management')
    }
    const file = req.files
    // console.log(file);
    const images = [];
    file.map(files => {
        return images.push(`/images/${files.originalname}`);
    });

    try {

        const addproduct = new productdb({
            Pname: req.body.productName,
            Pcategory: req.body.categoryName,
            productDescription: req.body.productDescription,
            Pmodel: req.body.productModel,
            price: req.body.price,
            color: req.body.color,
            quantity: req.body.Quantity,
            images: images

        })


        await addproduct.save();
        res.redirect('/product_management')
    } catch (error) {
        console.log(error);
    }
}

// edit product 
exports.submitEdit_product = async (req, res) => {
    const file = req.files
    // console.log(file);
    const images = `/images/${file[0].originalname}`
    // console.log(images);
    const idpass = await productdb.findOneAndUpdate({ _id: req.query.id }, {
        $set: {
            Pname: req.body.productName, Pcategory: req.body.categoryName,
            Pmodel: req.body.productModel, price: req.body.price, color: req.body.color, quantity: req.body.Quantity, images: images
        }
    })



    res.redirect('/product_management')
}

// delete product
exports.deleteproduct = async (req, res) => {
    try {
        // console.log('ziyad',req.query.id);
        const categoryId = await productdb.findOneAndUpdate({ _id: req.query.id }, { $set: { delete: true } })
        // console.log(categoryId)
        // res.render('unlistedcategory')
        res.redirect('/product_management')
    } catch (error) {
        console.log(error);
    }

}

// Unlist to product
exports.unlistToProduct = async (req, res) => {
    try {
        const unlistId = await productdb.findOneAndUpdate({ _id: req.query.id }, { $set: { delete: false } })
        // console.log(unlistId);
        res.redirect('/product/delete-product')
    } catch (error) {
        console.log(error);
    }
}


// CATEGORY MANAGEMENT .........................................................................
// add category ( file upload ) 
exports.categoryAdd = async (req, res) => {
    // console.log('fuuuuu') 
    if (!req.body) {
        res.status(400).send('Enter anything')
        return
    }

    const categoryName = req.body.category

    const categoryData = await categorydb.findOne({ category: categoryName })
    if (categoryData) {
        req.session.categoryError = 'Already used this category'
        return res.redirect('/Categary_management')
    }
    const file = req.files
    // console.log(file);
    const images = [];
    file.map(files => {
        return images.push(`/images/${files.originalname}`);
    });


    try {
        const addcategory = new categorydb({
            category: req.body.name,
            image: images

        })

        await addcategory.save()
        res.redirect('/Categary_management')
    } catch (error) {
        console.log(error);
    }
}


// update when click submit button
exports.submitEdit_category = async (req, res) => {
    try {

        // console.log('file',req.files)
        // console.log(req.query.id);
        const file = req.files
        const catName = req.body.name
        const images = `/images/${file[0].originalname}`

        const categoryName = categorydb.findOne({ category: catName })

        if (categoryName) {
            req.session.message = 'Category is Unique'
            return res.redirect('/category/edit-category')
        }

        const idPass = await categorydb.updateOne({ _id: req.query.id }, { $set: { category: req.body.name, image: images } })


        // console.log('hgdskjhgj',idPass)

        res.redirect('/Categary_management')

    } catch (error) {
        console.log(error)
    }
}


// delete category
exports.deletecategory = async (req, res) => {
    try {
        const categoryId = await categorydb.findOneAndUpdate({ _id: req.query.id }, { $set: { delete: true } })
        // console.log(categoryId)
        // res.render('unlistedcategory')
        res.redirect('/categary_management')
    } catch (error) {
        console.log(error);
    }

}

// Unlist to category
exports.unlistToCategory = async (req, res) => {
    try {
        const unlistId = await categorydb.findOneAndUpdate({ _id: req.query.id }, { $set: { delete: false } })
        // console.log(unlistId);
        res.redirect('/category/unlisted-category')
    } catch (error) {
        console.log(error);
    }
}



// USER MANAGEMENT ........................................................................................
// Block user and Unblock user
exports.blockUser = async (req, res) => {

    try {
        let userId = req.query.id
        // console.log('lool', userId);
        let userb = await Userdb.findByIdAndUpdate({ _id: userId }, { $set: { block: true } })
        // console.log(userb);
        res.redirect('/User_management')
    } catch (error) {
        res.status(500).send({ message: error })
    }
}

exports.unblockUser = async (req, res) => {
    try {
        let userId = req.query.id
        let userb = await Userdb.findByIdAndUpdate({ _id: userId }, { $set: { block: false } })
        // console.log(userb);
        res.redirect('/User_management')
    } catch (error) {
        res.status(500).send({ message: error })
    }
}





exports.findUser = async (req, res) => {
    try {
        const userdata = await Userdb.find()
        res.send(userdata)
    } catch (error) {
        res.send(error)
    }
}



// ORDER MANAGEMENT .............................................
// Order status changing 
exports.updateOrderStatus = async (req, res) => {
    const query = req.query.id
    // console.log(query);

    try {
        const status = req.body.status
        // console.log(status);
        await orderdb.updateOne({ "orderItems._id": query }, { $set: { "orderItems.$.orderStatus": status } })
        res.redirect('/Order_management')
    } catch (err) {
        res.status(500).send(err)
    }
}


// COUPON MANAGEMENT ===== // 
// Save to coupon db
exports.saveToCouponDb = async (req, res) => {
    try {
        // Extract data from request body
        const { couponCode, discount, maxUse, maxPrice, expiryDate } = req.body;

        // Create a new instance of the Coupon model
        const newCoupon = new coupondb({
            Code: couponCode,
            Discount: discount,
            Maxuse: maxUse,
            MaxPrice: maxPrice,
            expiryDate: expiryDate
        });

        // Save the new coupon to the database
        await newCoupon.save()
        

        // redirect
        res.redirect('/Coupon_management')
    } catch (error) {
        // Handle errors
        console.error('Error saving coupon:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// Delete coupon
exports.deleteCoupon = async (req, res) => {
    try {
        const PassId = req.query.id
        const deleteCoupon = await coupondb.deleteOne({ _id: new mongoose.Types.ObjectId(PassId) })
        res.redirect('/Coupon_management')
    } catch (error) {
        console.log(error);
    }
}

// Submit Editted Coupon
exports.submitEditedCoupon = async (req, res) => {
    try {
        const id = req.query.id
        const { couponCode, discount, maxUse, maxPrice, expiryDate } = req.body;

        


        const updateCoupon = await coupondb.findByIdAndUpdate({ _id: id }, {
            $set: {
                Code: couponCode,
                Discount: discount,
                Maxuse: maxUse,
                MaxPrice: maxPrice,
                expiryDate: expiryDate
            }
        })
        res.redirect('/Coupon_management')
    } catch (error) {
        console.log(error);
    }
}
