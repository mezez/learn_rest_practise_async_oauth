const passport = require('passport');
const keys = require('../config/keys');
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const GoogleStrategy = require('passport-google-oauth20').Strategy;

// passport.serializeUser((user,done) => {
//     done(null, userRecord._id)
// });

passport.serializeUser((user,done) => {
    done(null, user);
});

passport.deserializeUser( async (user, done) => {
   // const user = await User.findById(id);
    done(null, user);
});
passport.deserializeUser( async (id, done) => {
    const user = await User.findById(id);
    done(null, user);
});


passport.use(new GoogleStrategy(
    {
        clientID: keys.googleCLientID,
        clientSecret: keys.googleCLientSecret,
        callbackURL: '/auth/google/callback'
    },
    async (accessToken,refreshToken,profile,done) => {
        console.log({
            'acessToken':accessToken,
            'refreshToken':refreshToken,
            'profile':profile,
            'done':done,
        });

        //check if user already has an account, if no, create one, else
        let userRecord;
        userRecord = await User.findOne({googleId:profile.id});
        if(!userRecord){
            //create a new user
            const hashedPassword = await bcrypt.hash(Math.random()+'pass'+Math.random(),12);
            user = new User({
                googleId: profile.id,
                email: profile.emails[0].value,
                password: hashedPassword,
                name: profile.name.givenName+" "+profile.name.familyName,
                status: "New google User"
            });
            userRecord = await user.save();
        }
        const token = jwt.sign({
            email:userRecord.email,
            userId: userRecord._id.toString(),    
        }, keys.jwtSecret);
        userRecord.token = token;

        done(null, userRecord);

    }
));

