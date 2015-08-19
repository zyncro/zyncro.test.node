/*
 **     The following file will be used to test your API
 **     Please, complete it with accurate functionalities
 **
 **     The request/response/error event names has the following pattern:
 **         * request: "foo"
 **         * response: "onFoo"
 **         * error: "onFooError"
 **
 **     except the standard error and connect events
 */

'use strict';

var io = require('socket.io-client'),
    port = 3000,
    serverURL = 'http://localhost:' + port,
    Promise = require('bluebird');

var Client = function(username, startupScript) {
    this.getNewSocketWithUsername = function(username) {
        var options = {
            transports: ['websocket'],
            'force new connection': true
        };

        if (username) {
            options.query = 'username=' + username;
        }

        return new io.connect(serverURL, options);
    };

    this.startupScript = startupScript || null;
    this.username = username || null;
    this.socket = this.getNewSocketWithUsername(this.username);

    this.socket.on('connect', function() {
        console.log('Connected to server...', this.username);

        if (this.startupScript) {
            startupScript(this);
        }
    });

    return this;
};

Client.prototype.getUserList = function() {
    this.socket.emit('getUserList');
};

//Get profile of current/given user
Client.prototype.getUserProfile = function(username) {
    username = username || this.username;

    this.socket.emit('getProfile', {
        username: username
    });
};

//Signup
Client.prototype.signUp = function(username, name) {
    var self = this;
    return new Promise(function(resolve, reject) {

        self.socket.emit('signUp', {
            username: username,
            displayName: name
        });

        self.socket.on('onSignUp', function(userProfile) {
            resolve(userProfile);
            self.socket.disconnect();
        });

        self.socket.on('error', function(err) {
            reject(err);
        });
    });
};

//Follow a user
Client.prototype.followUser = function(userToFollow) {
    this.socket.emit('follow', {
        userToFollow: userToFollow
    });
};

//Unfollow a user
Client.prototype.unfollowUser = function(userToUnfollow) {
    this.socket.emit('unfollow', {
        userToUnfollow: userToUnfollow
    });
};

//Get the timeline of current/given user
Client.prototype.getTimeLine = function(username) {
    username = username || this.username;

    this.socket.emit('getTimeline', {
        username: username
    });
};

Client.prototype.postNewTweet = function(tweet) {
    this.socket.emit('createTweet', {
        text: tweet
    });
};

//"Responses"
var responseManager = function(client) {

    var socket = client.socket;
    client.socket.client = client;

    socket.on('onGetProfile', function(profile) {
        console.log('onGetProfile sent by ', client.username);
        console.log(profile);
    });

    // socket.on('onSignUp', function(profile) {
    //     if (client.signUpCallback) {
    //         client.signUpCallback(profile.username);
    //     }
    // });

    socket.on('onGetTimeline', function(timeline) {
        console.log('onGetTimeline sent by ', client.username);
        console.log('timeline', timeline);
    });

    //When you ask for a new user to follow, you will receive the following events:
    //onFollow: ack
    //onFollowTweets: pasts messages of the new followed users
    socket.on('onFollow', function(updatedFollowList) {
        console.log('onFollow sent by ', client.username);
        console.log(updatedFollowList);
    });

    socket.on('onGetUserList', function(userList) {
        console.log('onGetUserList sent by ', client.username);
        console.log(userList);
    });

    socket.on('onFollowTweets', function(posts) {
        console.log('onFollowTweets sent by ', client.username);
        console.log(posts);
    });

    socket.on('onUnfollow', function(updatedFollowList) {
        console.log('onUnfollow sent by ', client.username);
        console.log(updatedFollowList);
    });

    socket.on('onCreateTweet', function(tweet) {
        console.log('onCreateTweet sent by ', client.username);
        console.log(tweet);
    });

    socket.on('onTimelineUpdated', function(updates) {
        console.log('onTimelineUpdated sent by ', client.username);
        console.log(updates);
    });

    //ERROR Responses
    socket.on('onGetProfileError', function(err) {
        console.log('onGetProfile sent by ', client.username);
        console.error(err);
    });

    socket.on('onSignUpError', function(err) {
        console.error(err);
    });

    socket.on('onGetTimelineError', function(err) {
        console.error(err);
    });

    socket.on('onFollowError', function(err) {
        console.error(err);
    });

    socket.on('onUnfollowError', function(err) {
        console.error(err);
    });

    socket.on('onCreateTweetError', function(err) {
        console.error(err);
    });

    socket.on('onTimelineUpdatedError', function(err) {
        console.error(err);
    });

    //Standard socket calls
    socket.on('connect', function() {
        console.log('Connected to server...');
    });

    socket.on('error', function(err) {
        console.error(err);
    });

    return this;
};


//Example of login with existing user
var client1 = new Client('user7');
var response1 = new responseManager(client1);
client1.getUserList();


//Example of creating a new user (it will disconnect after creation)
var client2 = new Client();
client2.signUp('user9', 'Pepe')
    .then(function(userProfile) {
        console.log(userProfile.username, 'created OK. Socket disconnected');
    }).catch(function(err){
        console.error(err);
    });
