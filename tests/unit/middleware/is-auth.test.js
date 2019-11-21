const request = require('supertest');
const jwt = require('jsonwebtoken');
const isAuth = require('../../../middleware/is-auth');

describe('auth middleware', () => {
    let token;
    let userId = "user_id";

    beforeEach(() => {
        token = jwt.sign(
            {userId: userId}, 
            'somesupersecretsecret', 
            {expiresIn: '1h'});
    })


    it('should populated req.userId with the payload of a valid json web token', async () => {
        const req = {
            get: jest.fn().mockReturnValue("Bearer "+token)
            
        };
        const next = jest.fn();
        res = {};
        isAuth(req, res, next);

        expect(req.userId).toMatch(userId);
        
    });
});