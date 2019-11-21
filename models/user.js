const mongoose = require('mongoose');
const Schema = mongoose.Schema;

userSchema = new Schema({
    googleId:String,
    email:{
        type: String,
        required: true
    },
    password:{
        type: String,
        required: true
    },
    name:{
        type: String,
        required: true
    },
    status:{
        type: String,
        required: true,
        default: "I'm a new User"
    },
    posts:[{
        type: Schema.Types.ObjectId,
        ref: 'Post'
    }],

},
{timestamps:true}
);

module.exports = mongoose.model('User', userSchema);