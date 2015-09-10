/* 		Socket Client class
**
**		Encapsulates a socket connection within a connection client object
**
**		2015 - Eduardo Garcia Rajo
*/ 
'use string';

function SocketClient( socket ) {

	var Self 			= this;
	Self._id			= [];
	Self.socket 		= socket;
	Self.query			= socket.handshake.query;	
	Self.username 		= typeof Self.query.username !== 'undefined' || Self.query.username !== "" ? Self.query.username:null;
	Self.auth 			= false;
	Self.followings		= {};
	Self.followers		= {};

};

// Update the 'Followings' list
SocketClient.prototype.updateFollowingsList = function( followings ) {
	this.followings = followings;
};

// Update the 'Followers' list
SocketClient.prototype.updateFollowersList = function( followers ) {
	this.followers = followers;
};

// Update the 'Followers' list
SocketClient.prototype.setup = function( config ) {

	// Set client as authentificated
	this.auth = true;

	// Save the user ID in memory
	this._id = config._id;	

	// Set the client's username
	this.username = config.username;

	// Following / Followers
	this.followings = config.followings;
	this.followers = config.followers;

	// Create the client's room
	this.socket.join( config.username );
};

module.exports = SocketClient;