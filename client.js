/*
 **     The following file will be used to test your API
 **     Please, complete it with accurate functionalities
 **
 **     The request/response/error event names has the following pattern:
 **         * request: "foo"
 **         * response: "onFoo"
 **         * error: "onFooError"
 **
 **     except de standard error and connect events
 */

'use strict';

var io = require('socket.io-client'),
    port = 3000,
    serverURL = 'http://localhost:' + port;

var Client = function(username) {
    var self = this;

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

    self.username = username || null;
    self.socket = getNewSocketWithUsername(self.username);

    return self._socket;
};

//Get profile of current/given user
Client.prototype.getUserProfile = function(username) {
    username = username || self.username;

    self.socket.emit('getProfile', {
        username: username
    });
};

//Signup
Client.prototype.signUp = function(username, name) {
    self.socket.emit('signUp', {
        username: username,
        displayName: name
    });
};

//Follow a user
Client.prototype.followUser = function(userToFollow) {
    self.socket.emit('follow', {
        userToFollow: userToFollow
    });
};

//Unfollow a user
Client.prototype.unfollowUser = function(userToUnfollow) {
    self.socket.emit('unfollow', {
        userToUnfollow: userToUnfollow
    });
};

//Get the timeline of current/given user
Client.prototype.getTimeLine = function(username) {
    username = username || self.username;

    self.socket.emit('getTimeline', {
        username
    });
};

Client.prototype.postNewTweet = function(tweet) {
    self.socket.emit('createTweet', {
        text: tweet
    });
};


//"Responses"
var responseManager = function(socket) {
    socket.on('onGetProfile', function(profile) {
        console.log(profile);
    });

    socket.on('onSignUp', function(profile) {
        console.log(profile);
    });

    socket.on('onGetTimeline', function(timeline) {
        console.log(timeline);
    });

    //When you ask for a new user to follow, you will receive the following events:
    //onFollow: ack
    //onFollowTweets: pasts messages of the new followed users
    socket.on('onFollow', function(updatedFollowList) {
        console.log(updatedFollowList);
    });

    socket.on('onFollowTweets', function(posts) {
        console.log(posts);
    });

    socket.on('onUnfollow', function(updatedFollowList) {
        console.log(updatedFollowList);
    });

    socket.on('onCreateTweet', function(tweet) {
        console.log(tweet);
    });

    socket.on('onTimelineUpdated', function(updates) {
        console.log(updates);
    });

    //ERROR Responses
    socket.on('onGetProfileError', function(err) {
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
        console.log('CONNECTED...');
    });

    socket.on('error', function(err) {
        console.error(err);
    });
};

var socket1 = new Client('user8');
responseManager(socket1);
