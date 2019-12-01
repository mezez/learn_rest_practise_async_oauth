This is a RESTful API with web sockets for powering a light weight social network app
This application applies web sockets to inform the client app of when certain changes have been made on the server

See frontend https://github.com/mezez/-learn_rest_practise_async_front_end_graphql

Integration tests have also been configured for the server requests.

See app.js file to properly configure mongo db connection to suit requirements.

Note that a keys.js file is required in config folder.

it should be of this format:

module.exports = {
    googleCLientID: 'your google client id',
    googleCLientSecret: 'your google secret',
    mongoURI: 'upur mongo db uri',
    localMongoURI: 'your local mongo db uri if applicable',
    jwtSecret: "your json web token secret",
    cookieKey: "your cookie key",
};
