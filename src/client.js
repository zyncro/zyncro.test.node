/*
 **     Client class
 **     Please, feel free to complete or modify this file
 **
 **     The request/response/error event names has the following pattern:
 **         * request: "foo"
 **         * response: "onFoo"
 **         * error: "onFooError"
 **
 **     except the standard error and connect events
 **
 */

'use strict';

module.exports = function () {
  var Promise = require('bluebird');

  /* Constructor params:
  **    socket:             socket to use (injected)
  **    username:           client's username
  **    updatesCallback:    callback to receive updates from your the users you follow.
  **                        You can inform it from the constructor or by the setUpdatesCallback method
  */
  var Client = function (socket, username, updatesCallback) {
    var self = this;

    self.username = username || null;
    self.updatesCallback = updatesCallback || null;
    self.socket = socket;

    self.socket.on('connect', function () {
      console.log('Connected to server...', self.username);
    });

    self.socket.on('onTimelineUpdated', function (updates) {
      if (self.updatesCallback) {
        self.updatesCallback(updates);
      }
    });

    self.socket.on('onTimelineUpdatedError', function (err) {
      if (self.updatesCallback) {
        self.updatesCallback(null, err);
      }
    });

    self.socket.on('error', function (err) {
      console.error(err);
    });

    return self;
  };

  /*
  **    Methods
  */
  Client.prototype.setUpdatesCallback = function (callback) {
    this.updatesCallback = callback;
  };

  Client.prototype.getUserList = function () {
    var self = this;

    return new Promise(function (resolve, reject) {
      self.socket.emit('getUserList');

      self.socket.on('onGetUserList', function (userList) {
        resolve(userList);
      });

      self.socket.on('onGetUserListError', function (err) {
        reject(err);
      });
    });
  };

  //Get profile of current/given user
  Client.prototype.getUserProfile = function (username) {
    var self = this;

    return new Promise(function (resolve, reject) {
      username = username || self.username;

      self.socket.emit('getProfile', {
        username: username
      });

      self.socket.on('onGetProfileError', function (err) {
        reject(err);
      });

      self.socket.on('onGetProfile', function (profile) {
        resolve(profile);
      });
    });
  };

  //Signup
  Client.prototype.signUp = function (username, name) {
    var self = this;

    return new Promise(function (resolve, reject) {
      self.socket.emit('signUp', {
        username: username,
        displayName: name
      });

      self.socket.on('onSignUp', function (userProfile) {
        resolve(userProfile);
        self.socket.disconnect();
      });

      self.socket.on('error', function (err) {
        reject(err);
      });
    });
  };

  //Follow a user
  Client.prototype.followUser = function (username) {
    var self = this;

    return new Promise(function (resolve, reject) {
      self.socket.emit('followUser', {
        username: username
      });

      self.socket.on('onFollowUser', function (updatedFollowList) {
        resolve(updatedFollowList);
      });

      self.socket.on('onFollowUserError', function (err) {
        reject(err);
      });
    });
  };

  //Unfollow a user
  Client.prototype.unfollowUser = function (username) {
    var self = this;

    return new Promise(function (resolve, reject) {
      self.socket.emit('unfollowUser', {
        username: username
      });

      self.socket.on('onUnfollowUser', function (updatedFollowList) {
        resolve(updatedFollowList);
      });

      self.socket.on('onUnfollowUserError', function (err) {
        reject(err);
      });
    });
  };

  //Get the timeline of current/given user
  Client.prototype.getTimeLine = function (username) {
    var self = this;

    return new Promise(function (resolve, reject) {
      username = username || this.username;

      self.socket.emit('getTimeline', {
        username: username
      });

      self.socket.on('onGetTimeline', function (timeline) {
        resolve(timeline);
      });

      self.socket.on('onGetTimelineError', function (err) {
        reject(err);
      });
    });
  };

  Client.prototype.postNewTweet = function (tweet) {
    var self = this;

    return new Promise(function (resolve, reject) {
      self.socket.emit('createTweet', {
        message : tweet
      });

      self.socket.on('onCreateTweet', function (tweet) {
        resolve(tweet);
      });

      self.socket.on('onCreateTweetError', function (err) {
        reject(err);
      });

    });
  };

  return Client;
};
