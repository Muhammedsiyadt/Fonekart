if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}


const connectDB = require('./server/database/connection');
const express = require('express');
const session = require('express-session');
const app = express();
const path = require('path');

app.set('view engine', 'ejs');

app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
}));

app.use(express.urlencoded({ extended: false }));
app.use("/css", express.static(path.join(__dirname, 'assets/css')));
app.use("/js", express.static(path.join(__dirname, 'assets/js')));
app.use("/images", express.static(path.join(__dirname, 'assets/images')));

// User and Admin routes
app.use('/', require('./server/routes/router'));
app.use('/', require('./server/routes/adminRouter'));

// MongoDB connection
connectDB();

// 404 page
app.get("*", function (req, res) {
    res.status(404).render("404page");
});

const PORT = process.env.PORT || 1010;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
