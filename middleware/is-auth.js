const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const authHeader = req.get('Authorization');
    if(!authHeader){
        const error = new Error('Not authenticated');
        error.statusCode = 401;
        throw error;
    }
    const token =  authHeader.split(' ')[1];
    let decodedToken;
    try{
        decodedToken = jwt.verify(token, 'somesupersecretsecret');
    }catch(err){
        err.statusCode =500;
        throw err;
    }

    if(!decodedToken){
        //for some reason the verification didnt fail but somehow didnt verify either
        const error = new Error('Not authenticated');
        error.statusCode = 401;
        throw error;
    }

    //valid token, decoded successfully
    req.userId = decodedToken.userId; //recall userId was added when signing the token during login
    next();
};