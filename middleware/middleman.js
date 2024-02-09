const Userdb = require('../server/model/userSchema')

exports.userCheck = async (req, res, next) => {

    try {
        console.log(req.body.email);
        const userData = await Userdb.findOne({ email: req.body.email });

        if (userData.email != req.body.email) {
            // User with the same email already exists
            next(); 
           
        } else {
            // User does not exist, proceed to the next middleware or route handler
            res.render('register', { message: "Email already taken, Please enter a different email" });
        }
    } catch (error) {
        console.log(error);
        // Handle the error as needed
        res.status(500).send({ message: "Internal server error" });
    }
};
