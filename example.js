/*
 **     The following file will be used to test your API
 **     Please, feel free to complete or modify it
 **
 */
'use strict';

var io = require('socket.io-client'),
  port = 3000,
  serverURL = 'http://localhost:' + port,
  Client = require('./src/client')();

var getNewSocketWithUsername = function (username) {
  var options = {
    transports: ['websocket'],
    'force new connection': true
  };

  if (username) {
    options.query = 'username=' + username;
  }

  return new io.connect(serverURL, options);
};


//Example of existing user (user7) asking for the user list & the profile of user1
var client1 = new Client(getNewSocketWithUsername('user7'), 'user7');
client1.setUpdatesCallback(function (updates, err) {
  if (err) {
    console.error(err);
  } else {
    console.log('UPDATES', updates);
  }
});

client1.getUserList().then(function (userlist) {
  console.log('USERLIST', userlist);
});


client1.getUserProfile('user1').then(function (profile) {
  console.log('PROFILE', profile);
});

// Example of creating a new user (it will disconnect after creation)
var client2 = new Client(getNewSocketWithUsername());
client2.signUp('user9', 'Pepe').then(function (userProfile) {
  console.log(userProfile.username, 'created OK. Socket disconnected');
}).catch(function (err) {
  console.error(err);
});

//Example of request without user. It will return a 403 error like this:
//{ code: 403, description: 'You must specify a username in your query' }
var client3 = new Client(getNewSocketWithUsername());
client3.getUserList().then(function () {
  console.log('It won\'t enter here...');
}).catch(function (err) {
  console.error(err);
});
