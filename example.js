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


describe("Twitter like server API tests: ", function() {

  it("Should create a new account on server @ singUp event", function(done) {

    var anonUser = new Client(getNewSocketWithUsername(''), '');

    anonUser.socket.on('connect', function() {

      anonUser.signUp({ username : 'User8', displayName : 'AlphaCentauri' }).then(function (userProfile) {

        console.log('NEW PROFILE', userProfile);

        done();
      });

    });

  });


  it("Should retrieve the user's timeline @ getTimeLine event", function(done) {

    var client1 = new Client(getNewSocketWithUsername('User1'), 'User1');

    client1.socket.on('connect', function() {

      client1.getTimeLine('User1').then(function (userTimeline) {

        //console.log('USER TIMELINE', userTimeline);

        done();
      });

    });

  });  

  it("Should start following a User @ followUser event", function(done) {

    var client2 = new Client(getNewSocketWithUsername('User2'), 'User2');

    client2.socket.on('connect', function() {

      client2.followUser('User1').then(function (followingUser) {

        console.log('NOW FOLLOWING: ', followingUser);

        done();
      });

    });

  }); 

  it("Should stop following a User @ unfollowUser event", function(done) {

    var client2 = new Client(getNewSocketWithUsername('User2'), 'User2');

    client2.socket.on('connect', function() {

      client2.unfollowUser('User1').then(function (unfollowingUser) {

        //console.log('NOW UNFOLLOWING: ', unfollowingUser);

        done();
      });

    });

  }); 

  it("Should get the User List from server @ getUserList event", function(done) {

    var client3 = new Client(getNewSocketWithUsername('user3'), 'user3');

    client3.socket.on('connect', function() {

      client3.getUserList().then(function (userlist) {

        //console.log('USERLIST', userlist);

        done();

      });

    });

  });

  it("Should post a new Tweet @ createTweet event", function(done) {

    var client4 = new Client(getNewSocketWithUsername('user4'), 'user4');

    client4.socket.on('connect', function() {

      client4.postNewTweet("This is a new Tweet message.").then(function (newTweet) {

        console.log('USERLIST', newTweet);

        done();

      }).catch(done);

    });

  });
});



/*
    client7.setUpdatesCallback(function (updates, err) {
      if (err) {
        console.error(err);
      } else {
        console.log('UPDATES', updates);
      }
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
*/