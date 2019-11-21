const request = require('supertest');
const jwt = require('jsonwebtoken');


describe('is-auth middleware', () => {
    
    let token;
    const exec = () => {
        return request(server).get('/feed/posts').set('Authorization', "Bearer "+token);
    }

    beforeEach(() => {
        server = require('../../app');
        token = jwt.sign(
            {}, 
            'somesupersecretsecret', 
            {expiresIn: '1h'});
    })

    afterEach(async () => {
        server.close();
    });

    it('should return 401 status if no token is provided', async () => {

        res = await request(server).get('/feed/posts');
        expect(res.status).toBe(401);
    });

    it('should return 500 status if invalid token is provided', async () => {
        token = jwt.sign(
            {}, 
            'invalidsecret', 
            {expiresIn: '1h'});
        const res = await exec();
        expect(res.status).toBe(500);
    });

    //the test for valid user id will be done as a unit test as we do not have access to the req object in jest and
});