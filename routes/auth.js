const express = require('express');
const passport = require('passport');
const { body, check } = require('express-validator');
const router = express.Router();

const User = require('../models/user');
const authController = require('../controllers/auth');
const isAuth = require('../middleware/is-auth');


router.post('/signup', [
    check('email').isEmail().normalizeEmail().custom((value, { req }) => {
        
        return User.findOne({ email: value }).then(userDoc => {
            // A user already exists with the email
            if (userDoc) {
                //return new Promise.reject(new Error('Email exists already'));
                let promise = new Promise( (resolve, reject) =>{
                    reject(new Error('Email exists already'));
                });

                return promise;
            }
        });
    }).withMessage('Please enter a valid email'),
    body('password').trim().isLength({ min: 5 }),
    body('name').trim().not().isEmpty()
], authController.signup);
router.post('/login',authController.login);
router.get('/status',isAuth, authController.status);
router.post('/status', isAuth, [
    body('status').trim().isLength({min: 2}),
],  authController.updateStatus);

//google login
router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email']
}));

router.get('/google/callback', passport.authenticate('google'), (req, res) => {
    console.log(req.user);
    
    return res.status(200).json({token: req.user.token, userId: req.user._id.toString()});
});

module.exports = router;