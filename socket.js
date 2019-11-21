let io;

module.exports = {
    //init is a function defined inside an object. node.js format for defining a function
    init: httpServer => {
       io = require('socket.io')(httpServer);
       return io;
    },

    getIO: () => {
         if(!io){
             throw new Error('socket.io has not been initialized');
         }
         return io;
    }
}