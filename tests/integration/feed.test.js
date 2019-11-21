const request = require('supertest');
const Post = require('../../models/post');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');


let server;
let token;

describe('/feed', () => {
    beforeEach(() => {
        server = require('../../app');
        token = jwt.sign(
            {}, 
            'somesupersecretsecret', 
            {expiresIn: '1h'});
    })
    afterEach(async () => {
        await Post.remove({});
        server.close();
    })
    describe('GET /posts', () => {
        it('should return all posts', async () => {
            await Post.collection.insertMany([
                { title: "First post", imageUrl: "image/url", content: "This ia a post", creator: mongoose.Types.ObjectId('4edd40c86762e0fb12000003') },
                { title: "Second post", imageUrl: "image/url2", content: "This ia a second post", creator: mongoose.Types.ObjectId('4edd40c86762e0fb12000004') }
            ]);

            const res = await request(server).get('/feed/posts').set('Authorization', "Bearer "+token);
            //console.log(res.body);

            expect(res.status).toBe(200);
            expect(res.body.posts.length).toBe(2);
            expect(res.body.posts.some(post => post.title === "First post")).toBeTruthy();
            expect(res.body.posts.some(post => post.title === "Second post")).toBeTruthy();

        });
    });
    describe('GET /post/:postId', () => {
       
            
        it('should return a 401 status code if user is not authenticated',async () => {
            const res = await request(server).get('/feed/post/12345');
            expect(res.status).toBe(401);
        });

        it('should return a single post, given a valid id', async () => {
            //ensure user passes authentication
            //log the user in
            
            

            //create a post then retrieve the id
            const post = new Post({ title: "First post", imageUrl: "image/url", content: "This ia a post", creator: mongoose.Types.ObjectId('4edd40c86762e0fb12000003') });
            const result = await post.save();
            const postId = result._id.toString();
            const res = await request(server).get('/feed/post/' + postId).set('Authorization', "Bearer "+token);

            //console.log(res);
            expect(res.status).toBe(200);
            expect(res.body.post._id).toBeDefined();
            expect(res.body.post._id).toMatch(postId);
            expect(res.body.post).toHaveProperty('title',post.title); //not compulsory to set the value of the property
        });

        it('should return 404 if no post is found, given invalid id', async () => {
        
            const postId = mongoose.Types.ObjectId('4edd40c86762e0fb12000003');
            const res = await request(server).get('/feed/post/' + postId).set('Authorization', "Bearer "+token);
            expect(res.status).toBe(404) ;
        });
        
    });
    
});