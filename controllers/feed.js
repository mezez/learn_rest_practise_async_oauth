const { validationResult } = require('express-validator');
const fs = require('fs');
const path = require('path');
const Post = require('../models/post');
const User = require('../models/user');
const io = require('../socket');

exports.getPosts = async (req, res, next) => {
    const currentPage = req.query.page || 1;
    const perPage = 2;

    try {

        const totalItems = await Post.find().countDocuments();
        const posts = await Post.find().populate('creator').sort({ createdAt: -1 }).skip((currentPage - 1) * perPage).limit(perPage);
        if (!posts) {
            const error = new Error("Posts not found");
            error.statusCode = 404;
            throw error;
        }
        res.status(200).json({
            posts: posts,
            totalItems: totalItems
        });

    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.getSinglePost = (req, res, next) => {
    const postId = req.params.postId;
    Post.findById(postId)
        .then(post => {
            if (!post) {
                const error = new Error("Post could not be found");
                error.statusCode = 404;
                throw error; //next is cool here but also throwing this error will make make the execution get to the
                //catch block below, which still takes care of business
            }
            res.status(200).json({
                post: post
            });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};
exports.createPosts = async (req, res, next) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const error = new Error("Validation failed");
        console.log(errors.array());

        error.statusCode = 422;
        throw error;
        // return res.status(422).json({
        //     message:"validation failed",
        //     errors: errors.array()
        // });
    }
    if (!req.file) {
        const error = new Error('No image uploaded');
        error.statusCode = 422; //validation error
        throw error;
    }
    const imageUrl = req.file.path;
    const title = req.body.title;
    const content = req.body.content;
    let creator;

    //create post in the database

    const post = new Post({
        title: title,
        content: content,
        imageUrl: imageUrl,
        creator: req.userId, //this is set in is-auth middleware

    });

    try {
        await post.save()

        const user = await User.findById(req.userId);
        //console.log(user);
        user.posts.push(post);
        await user.save();
        //io.getIO().emit('posts', {action: 'create',post: post}); //sends a message to all connected users
        io.getIO().emit('posts', { action: 'create', post: { ...post._doc, creator: { _id: req.userId, name: user.name } } }); //sends a message to all connected users
        //the first argument, an event listener, we can choose any convenient name. Should match what is being listened
        //for on the client side
        //the second argument passed to emit is totally at your discretion. see documentation
        //see also broadcast, sends a message to all users except the user who made this request
        res.status(201).json({
            message: "Post created successfullly",
            post: post,
            creator: { _id: user._id, name: user.name }
        });
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            //throwing an error inside an async code will not reach the next error handling middleware
            //so calling the next function and passing the error to it will do the trick
        }
        next(err); //this will take the code to the next express error handling middleware
        //console.log(err)
    }


};

exports.updatePost = async (req, res, next) => {
    const postId = req.params.postId;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed. Check the data submitted');
        error.statusCode = 422;
        throw error;
    }

    const title = req.body.title;
    const content = req.body.content;
    let imageUrl = req.body.image;
    if (req.file) {
        imageUrl = req.file.path;
    }

    if (!imageUrl) {
        const error = new Error('No file picked');
        error.statusCode = 422;
        throw error;
    }

    try {
        //update the database
        const post = await Post.findById(postId).populate('creator');

        if (!post) {
            const error = new Error('Post not found');
            error.statusCode = 404;
            throw error;
        }

        if (post.creator._id.toString() !== req.userId) {
            const error = new Error("Not authorized");
            error.statusCode = 403;
            throw error;
        }

        //if a new image is uploaded, delete the existing file in the images folder
        if (imageUrl !== post.imageUrl) {
            clearImage(post.imageUrl);
        }

        post.title = title;
        post.content = content;
        post.imageUrl = imageUrl;
        post.creator = req.userId; //would not be necessary if the method was PUT as this should not change  
        const result = await post.save();
        io.getIO().emit('posts', { action: 'update', post: result });

        res.status(200).json({ message: "post updated successfully", post: result });

    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

const clearImage = filePath => {
    filepath = path.join(__dirname, '..', filePath);
    fs.unlink(filePath, err => console.log(err));
};

exports.deletePost = async (req, res, next) => {
    const postId = req.params.postId;
    let imageUrl;
    try {
        const post = await Post.findById(postId);
        //checked logged in user 
        if (!post) {
            const error = new Error("Post not found");
            error.statusCode = 404;
            throw error;
        }
        if (post.creator.toString() !== req.userId) {
            const error = new Error("Not authorized");
            error.statusCode = 403;
            throw error;
        }

        imageUrl = post.imageUrl;
        await Post.findByIdAndRemove(postId);

        //delete the image
        clearImage(imageUrl);
        //console.log(result);

        //delete the reference in the users collection
        const user = await User.findById(req.userId);

        user.posts.pull(postId);
        await user.save();
        io.getIO().emit('posts', { action: "delete", data: postId });
        res.status(200).json({ message: "post deleted successfully" });

    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    };

};