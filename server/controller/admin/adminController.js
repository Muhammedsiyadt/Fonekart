
// user-schema
const Userdb = require('../../model/userSchema')
const categorydb = require('../../model/categorySchema')
const productdb = require('../../model/productSchema')
const multer = require('./multer')
const orderdb = require('../../model/orderSchema')
const coupondb = require('../../model/couponSchema')
const { default: mongoose } = require('mongoose')
const offerdb = require('../../model/offerSchema')
const refferaldb = require('../../model/refferalSchema')
const PDFDocument = require("pdfkit-table") 
const fs = require("fs")






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

// SALES REPORT =====
//daily 
exports.dailyReport = async (req, res) => {
    try {
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

       
        const dailyOrders = await orderdb.find({
            orderDate: {
                $gte: startOfDay,
                $lt: endOfDay
            }
        });

       
        const doc = new PDFDocument();

     
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="daily_sales_report.pdf"');

       
        doc.pipe(res);

       
        doc.fontSize(12).text('Daily Sales Report', { align: 'center' }).moveDown();

       
        const tableHeaders = ['Order Date', "User's Name", 'Address', 'Phone', 'Product Name', 'Category', 'Order Status', 'Price'];

        let totalPrice = 0;
        const tableData = [];

        dailyOrders.forEach(order => {
            order.orderItems.forEach(item => {
                tableData.push([
                    order.orderDate.toDateString(),
                    order.address.name,
                    `${order.address.address}, ${order.address.district}, ${order.address.city}, ${order.address.pin}`,
                    order.address.phone,
                    item.Pname || 'N/A',
                    item.category || 'N/A',
                    item.orderStatus || 'N/A',
                    item.price !== undefined ? item.price.toString() : 'N/A'
                ])
                if (item.price !== undefined) {
                    totalPrice += item.price;
                }
            });
        })

        tableData.push(['Total Price', '', '', '', '', '', '', totalPrice.toString()]);

        
        const tableOptions = {
            headers: tableHeaders, 
            rows: tableData 
        };

        
        doc.table(tableOptions);

      
        doc.end();

    } catch (error) {
        console.error("Error generating daily sales report:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}



// weekly
exports.weeklyReport = async (req, res) => {
    try {
        const startDate = new Date()
        const endDate = new Date(startDate.getTime() - 7 * 24 * 60 * 60 * 1000)

        let doc = new PDFDocument({ margin: 10, size: 'A4' }) // Move this line up

        const weeklyOrders = await orderdb.find({
            orderDate: {
                $gte: endDate,
                $lt: startDate
            }
        });

        const tableHeaders = ['Order Date', "User's Name", 'Address', 'Phone', 'Product Name', 'Category', 'Order Status', 'Price'];

        let totalPrice = 0;

        const tableData = [];

        weeklyOrders.forEach(order => {
            order.orderItems.forEach(item => {
                tableData.push([    
                    order.orderDate.toDateString(),
                    order.address.name,
                    `${order.address.address}, ${order.address.district}, ${order.address.city}, ${order.address.pin}`,
                    order.address.phone,
                    item.Pname || 'N/A',
                    item.category || 'N/A',
                    item.orderStatus || 'N/A',
                    item.price !== undefined ? item.price.toString() : 'N/A',
                ])
                if (item.price !== undefined) {
                    totalPrice += item.price;
                }
            })
        })
        tableData.push(['Total Price', '', '', '', '', '', '', totalPrice.toString()]);

        doc.fontSize(14).text('Fonekart', { align: 'center' }).moveDown();
        const table = {
            title: 'Weekly Sales Report',
            headers: tableHeaders,
            rows: tableData
        }

        await doc.table(table)

        const pdfChunks = []
        doc.on('data', chunk => {
            pdfChunks.push(chunk)
        });
        doc.on('end', () => {
            const pdfBuffer = Buffer.concat(pdfChunks)
            
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'attachment; filename="weekly_sales_report.pdf"')
           
            res.send(pdfBuffer);
        });
        doc.end()
    } catch (error) {
        console.error("Error generating weekly sales report:", error)
        res.status(500).json({ error: "Internal server error" })
    }
}


// yearly 
exports.yearlyReport = async (req, res) => {
    try {
        const startOfYear = new Date(new Date().getFullYear(), 0, 1)
        const endOfYear = new Date(new Date().getFullYear() + 1, 0, 1)

      
        const yearlyOrders = await orderdb.find({
            orderDate: {
                $gte: startOfYear,
                $lt: endOfYear
            }
        }) 

       
        const tableHeaders = ['Order Date', "User's Name", 'Address', 'Phone', 'Product Name', 'Category', 'Order Status', 'Price'];

      
        let totalPrice = 0;

        const tableData = [];

        yearlyOrders.forEach(order => {
            order.orderItems.forEach(item => {
                tableData.push([
                    order.orderDate.toDateString(),
                    order.address.name,
                    `${order.address.address}, ${order.address.district}, ${order.address.city}, ${order.address.pin}`,
                    order.address.phone,
                    item.Pname || 'N/A',
                    item.category || 'N/A',
                    item.orderStatus || 'N/A',
                    item.price !== undefined ? item.price.toString() : 'N/A',
                ])

                if (item.price !== undefined) {
                    totalPrice += item.price;
                }
            });
        });

        tableData.push(['Total Price', '', '', '', '', '', '', totalPrice.toString()]);

       
        const doc = new PDFDocument();

        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="yearly_sales_report.pdf"');

       
        doc.pipe(res);

     
        doc.fontSize(14).text('Fonekart', { align: 'center' }).moveDown();

      
        const tableOptions = {
            title: 'Yearly Sales Report',
            headers: tableHeaders,
            rows: tableData
        };

      
        await doc.table(tableOptions);

       
        doc.end();

    } catch (error) {
        console.error("Error generating yearly sales report:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

// custome date 
exports.customDateSales = async (req, res) => {
    try {
        const from = new Date(req.body.fromDate);
        const to = new Date(req.body.toDate);

        const sales = await orderdb.find({
            orderDate: {
                $gte: from,
                $lt: to
            }
        });

        const tableHeaders = ['Order Date', "User's Name", 'Address', 'Phone', 'Product Name', 'Category', 'Order Status', 'Price'];

        let totalPrice = 0; // Initialize total price

        const tableData = [];

        sales.forEach(order => {
            order.orderItems.forEach(item => {
                tableData.push([
                    order.orderDate.toDateString(),
                    order.address.name,
                    `${order.address.address}, ${order.address.district}, ${order.address.city}, ${order.address.pin}`,
                    order.address.phone,
                    item.Pname || 'N/A',
                    item.category || 'N/A',
                    item.orderStatus || 'N/A',
                    item.price !== undefined ? item.price.toString() : 'N/A',
                ]);

               
                if (item.price !== undefined) {
                    totalPrice += item.price;
                }
            });
        });

        // Add total price as the last row
        tableData.push(['Total Price', '', '', '', '', '', '', totalPrice.toString()]);

        const doc = new PDFDocument();

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="custom_date_sales_report.pdf"');

        doc.pipe(res);

        doc.fontSize(14).text('Custom Date Sales Report', { align: 'center' }).moveDown();

        const tableOptions = {
            title: 'Custom Date Sales Report',
            headers: tableHeaders,
            rows: tableData
        };

        await doc.table(tableOptions);

        doc.end();

    } catch (error) {
        console.error("Error generating custom date sales report:", error);
        res.status(500).json({ error: "Internal server error" });
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
// exports.submitEdit_product = async (req, res) => {
   
//     const file = req.files
    
//     const images = [];
//     file.map(files => {
//         return images.push(`/images/${files.originalname}`);
//     });
//     const idpass = await productdb.findOneAndUpdate({ _id: req.query.id }, {
//         $set: {
//             Pname: req.body.productName, Pcategory: req.body.categoryName,
//             Pmodel: req.body.productModel, price: req.body.price, color: req.body.color, quantity: req.body.Quantity, images: images
//         }
//     })



//     res.redirect('/product_management')
// }

exports.submitEdit_product = async (req, res) => {
    const file = req.files;

  
    let images = [];
    if (file && file.length > 0) {

        images = file.map(file => `/images/${file.originalname}`);
    } else {
       
        const existingProduct = await productdb.findById(req.query.id);
        images = existingProduct.images;
    }

    
    const idpass = await productdb.findOneAndUpdate({ _id: req.query.id }, {
        $set: {
            Pname: req.body.productName,
            Pcategory: req.body.categoryName,
            Pmodel: req.body.productModel,
            price: req.body.price,
            color: req.body.color,
            quantity: req.body.Quantity,
            images: images
        }
    });

    res.redirect('/product_management');
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

// image delete while editing
exports.imageDeleteSeperate = async (req, res) => {

    const img = req.query.image;

    try {
        
        const product = await productdb.findOne({ images: img });

        await productdb.findOneAndUpdate(
            { images: img },
            { $pull: { images: img } }
        );

        
        res.redirect(`/product/edit-product?id=${product._id}`);

    } catch (error) {
        console.error("Error deleting image:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};




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
        const { couponCode, discount, maxUse, maxPrice, expiryDate } = req.body;
        
        const existingCoupon = await coupondb.findOne({ Code: couponCode });

        if (existingCoupon) {
            req.session.Existmessage = 'Coupon code already exists';
            return res.redirect('/addCoupon');
        } else {
            const newCoupon = new coupondb({
                Code: couponCode,
                Discount: discount,
                Maxuse: maxUse,
                MaxPrice: maxPrice,
                expiryDate: expiryDate
            });

            await newCoupon.save();
        } 

        req.session.message = 'Coupon saved successfully';
        return res.redirect('/Coupon_management'); // Change here to return

    } catch (error) {
        console.error('Error saving coupon:', error);
        return res.status(500).json({ error: 'Internal server error' }); // Change here to return
    }
};



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

// === OFFER MANAGEMENT=== // 
// save the data of category offer
exports.saveToOfferOfCategory = async (req, res) => {
    const { category, discount, expiryDate } = req.body;

    const existingOffer = await offerdb.findOne({ name: category });

    if (existingOffer) {
        req.session.Existmessage = 'Offer for this category already exists';
        res.redirect('Offer_management');
        return; 
    } else {
        const newOffer = new offerdb({
            name: category,
            discount: discount,
            expirydate: expiryDate
        });

        await newOffer.save();

        const id = newOffer._id
        console.log(id) 

        req.session.message = 'Offer saved successfully';
        res.redirect('Offer_management');

        const categoryFind = await productdb.updateMany({Pcategory : category},{$set:{offerId:id}})
        
    }
}

// save the data of product offer
exports.saveToOfferOfProduct = async (req, res) => {
    let { product, discount, expiryDate } = req.body;

    const existingOffer = await offerdb.findOne({ name: product });

    if (existingOffer) {
        req.session.Existmessage = 'Offer for this product already exists';
        res.redirect('Offer_management');
        return; 
    } else {
        const newOffer = new offerdb({
            name : product,
            discount : discount,
            expirydate : expiryDate
        });

        await newOffer.save();

        const id = newOffer._id
       

        req.session.message = 'Offer saved successfully';
        res.redirect('Offer_management');

        const productFind = await productdb.updateOne({Pname: product},{$set:{offerId:id}})
        const fff = await productdb.find({Pname:product})
        console.log(fff);
    }

}

// Delete offer
exports.deleteOffer = async(req,res) => {
    try {
        const PassId = req.query.id
        const deleteOffer = await offerdb.deleteOne({ _id: new mongoose.Types.ObjectId(PassId) })
        res.redirect('/offer_management')
    } catch (error) {
        console.log(error);
    }
}


// REFERAL OFFER //
// add refferal offer
exports.saveRefferal = async (req, res) => {
    try {
        

        const { referralAmount, referredAmount, expireDate } = req.body

       
        const referral = new refferaldb({
            referralAmount: referralAmount,
            referredAmount: referredAmount,
            expiredate: expireDate
        })

        await referral.save()

        res.redirect('/refferalOffer')

    } catch (error) {
      
        console.error("Error saving referral offer:", error);
        return res.status(500).json({ error: "An error occurred while saving referral offer" })
    }
}

// Delete refferel offer 
exports.deleteRefferal = async (req, res) => {
    try {
        
        const deleteRefferalId = req.query.id

       
        await refferaldb.deleteOne({ _id: deleteRefferalId })

       
        res.redirect('/refferalOffer')

    } catch (error) {
    
        console.error("Error deleting referral offer:", error)
        res.status(500).send("An error occurred while deleting referral offer.")
    }
}
