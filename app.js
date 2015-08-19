/*
 **     The following file will be used to test your API
 **     Please, feel free to complete or modify it
 **
 */
'use strict';

var io = require('socket.io-client'),
    port = 3000,
    serverURL = 'http://localhost:' + port,
    // inherits  = require('util').inherits,
    Client = require('./src/client')();

var getNewSocketWithUsername = function(username) {
    var options = {
        transports: ['websocket'],
        'force new connection': true
    };

    if (username) {
        options.query = 'username=' + username;
    }

    return new io.connect(serverURL, options);
};



var client1 = new Client(getNewSocketWithUsername('user7'), 'user7');
client1.getUserList().then(function(userlist) {
    console.log('USERLIST', userlist);
});

client1.getUserProfile('user1').then(function(profile) {
    console.log('PROFILE',profile);
});

// Example of creating a new user (it will disconnect after creation)
var client2 = new Client(getNewSocketWithUsername());
client2.signUp('user9', 'Pepe').then(function(userProfile) {
    console.log(userProfile.username, 'created OK. Socket disconnected');
}).catch(function(err) {
    console.error(err);
});
