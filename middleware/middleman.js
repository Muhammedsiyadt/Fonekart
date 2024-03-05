const Userdb = require('../server/model/userSchema')

exports.userCheck = async (req, res, next) => {

    try {
        console.log(req.body.email);
        const userData = await Userdb.findOne({ email: req.body.email });

        if (userData.email != req.body.email) {
            // User with the same email already exists
            next();

        } else {

            res.render('register', { message: "Email already taken, Please enter a different email" });
        }
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Internal server error" });
    }
};

exports.isBlocked = async (req, res, next) => {
    

    try {
        let allUser = await Userdb.findOne({ _id : req.session.userId })
       
        if(allUser && allUser.block !== null){
            if(allUser.block === true){
                req.session.destroy();
                res.redirect('/home')
                
            }else{
                next()
            }
        }else{
            next()
        }
    } catch (error) {
        console.log(error);
    }
}

exports.backProfile = async (req,res,next) => {
    const userId = req.session.userId
      
    if(userId){
      
        res.redirect('/home/profile')
    }else{
        next() 
    }
}

// Middleware function to validate date format
exports.validateDateFormat = (req, res, next) => {
    const { fromDate, toDate } = req.body;
    const dateFormat = /^\d{4}-\d{2}-\d{2}$/;

    if (!dateFormat.test(fromDate) || !dateFormat.test(toDate)) {
        return res.status(400).json({ error: 'Invalid date format. Please use the format YYYY-MM-DD.' });
    }

    next();
};