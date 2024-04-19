if (process.env.PORT !== 'production') {
    require('dotenv').config()
}

const connectDB = require('./server/database/connection')


const express = require('express')
const session = require('express-session')
const app = express()
const path = require('path')

app.set('view engine', 'ejs')

app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    // cookie: { secure: true } 
}))


// RAZOR PAY INTEGRATION
// const razorpay = new Razorpay({
//     key_id: 'rzp_test_dDFjMxYqYkOIho', 

//        key_secret: 'e69HlqkXDDdL7HY5e3cx8XQ9'
//     })



app.use(express.urlencoded({ extended: false }))  

app.use("/css", express.static(path.join(__dirname, 'Assets/css')))
app.use("/js", express.static(path.join(__dirname, 'Assets/js')))
app.use("/images", express.static(path.join(__dirname, 'Assets/images'))) 

// user 
app.use('/', require('./server/routes/router'))

// admin
app.use('/', require('./server/routes/adminRouter'))

// Mongo db connection
connectDB();

// 404 page
app.get("*", function (req, res) {
    res.status(404).render("404page")
})


const PORT = process.env.PORT || 1010

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
})