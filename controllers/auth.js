const {validationResult} = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const passportMiddleware = require('../middleware/passport');

exports.signup = (req, res, next) => {
    //console.log([req.body.email,req.body.password]);
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        const error = new Error('Validation failed.');
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
    }
    const email = req.body.email;
    const password = req.body.password;
    const name = req.body.name;

    
    
    
    bcrypt.hash(password, 12)
    .then(hashedPassword => {
        const user = new User({
            email: email,
            password: hashedPassword,
            name: name
        });

        return user.save();
    })
    .then(result => {
        res.status(201).json({
            message: "User created successfully", userId: result._id
        });
    })
    .catch(err => {
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    });
    
}

exports.login = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    let loadedUser;
    User.findOne({email: email})
    .then(user => {
        if(!user){
            const error = new Error('User not found');
            error.statusCode = 401;
            throw error;
        }

        loadedUser = user;
        return bcrypt.compare(password, user.password);
    })
    .then(isEqual => {
        if(!isEqual){
            const error =  new Error("Incorrect password");
            error.statusCode = 401;
            throw error;
        }
        const token = jwt.sign(
            {
                email: loadedUser.email, 
                userId: loadedUser._id.toString()
            }, 
            'somesupersecretsecret', 
            {expiresIn: '1h'}); //note that adding email and user id here are abosolutely optional
            return res.status(200).json({token: token, userId: loadedUser._id.toString()});
    })
    .catch(err => {
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    });

};

exports.status = async (req, res, next) => {
    try{
    const user =  await User.findById(req.userId);
    //console.log(user);
    
    return res.status(200).json({status: user.status});
    }catch(err){
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.updateStatus = async (req, res, next) => {
    const status = req.body.status;
    console.log(req.body);
    
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        //console.log(errors);
        const error = new Error('Validation failed');
        error.statusCode = 422;
        throw error;
    }
    //const status = req.body.status;
    try{
    await User.findByIdAndUpdate(req.userId, {status: status});
    return res.status(200).json({message: "Your status has been updated"});
    }catch(err){
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    }
}
