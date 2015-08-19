/*
 **     Please, feel free to complete or modify this file
 **
 **     The request/response/error event names has the following pattern:
 **         * request: "foo"
 **         * response: "onFoo"
 **         * error: "onFooError"
 **
 **     except the standard error and connect events
 */

'use strict';
var Promise = require('bluebird');

module.exports = function() {

    var Client = function(socket, username) {
        var self = this;

        this.username = username || null;
        this.socket = socket;

        this.socket.on('connect', function() {
            console.log('Connected to server...', self.username);
        });

        this.socket.on('onTimelineUpdated', function(updates) {
            console.log('onTimelineUpdated sent by ', self.username);
            console.log(updates);
        });

        this.socket.on('onTimelineUpdatedError', function(err) {
            console.error(err);
        });

        this.socket.on('error', function(err) {
            console.error(err);
        });

        return this;
    };

    Client.prototype.getUserList = function() {
        var self = this;

        return new Promise(function(resolve, reject) {
            self.socket.emit('getUserList');

            self.socket.on('onGetUserList', function(userList) {
                resolve(userList);
            });

            self.socket.on('onGetUserListError', function(err) {
                reject(err);
            });
        });
    };

    //Get profile of current/given user
    Client.prototype.getUserProfile = function(username) {
        var self = this;

        return new Promise(function(resolve, reject) {
            username = username || self.username;

            self.socket.emit('getProfile', {
                username: username
            });

            self.socket.on('onGetProfileError', function(err) {
                reject(err);
            });

            self.socket.on('onGetProfile', function(profile) {
                resolve(profile);
            });
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
    Client.prototype.followUser = function(username) {
        var self = this;

        return new Promise(function(resolve, reject) {
            self.socket.emit('follow', {
                username: username
            });

            self.socket.on('onFollow', function(updatedFollowList) {
                resolve(updatedFollowList);
            });

            self.socket.on('onFollowError', function(err) {
                reject(err);
            });
        });
    };

    //Unfollow a user
    Client.prototype.unfollowUser = function(username) {
        var self = this;

        return new Promise(function(resolve, reject) {
            self.socket.emit('unfollow', {
                username: username
            });

            self.socket.on('onUnfollow', function(updatedFollowList) {
                resolve(updatedFollowList);
            });

            self.socket.on('onUnfollowError', function(err) {
                reject(err);
            });
        });
    };

    //Get the timeline of current/given user
    Client.prototype.getTimeLine = function(username) {
        var self = this;

        return new Promise(function(resolve, reject) {
            username = username || this.username;

            self.socket.emit('getTimeline', {
                username: username
            });

            self.socket.on('onGetTimeline', function(timeline) {
                resolve(timeline);
            });

            self.socket.on('onGetTimelineError', function(err) {
                reject(err);
            });
        });
    };

    Client.prototype.postNewTweet = function(tweet) {
        var self = this;

        return new Promise(function(resolve, reject) {
            self.socket.emit('createTweet', {
                text: tweet
            });

            self.socket.on('onCreateTweet', function(tweet) {
                resolve(tweet);
            });

            self.socket.on('onCreateTweetError', function(err) {
                reject(err);
            });

        });
    };

    return Client;
};
