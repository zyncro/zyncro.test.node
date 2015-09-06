/* 		Socket Client class
**
**		Encapsulates a socket connection within a connection client.
**
**
*/ 
'use string';

function SocketClient( socket ) {

	var Self 		= this;
	Self.socket 	= socket;
	Self.query		= socket.handshake.query;	
	Self.username 	= typeof Self.query.username !== 'undefined' || Self.query.username !== "" ? Self.query.username:null;
	Self.auth 		= false;
	Self.room		= Self.username;
	Self.following	= {};
	Self.followers	= {};

};

// Update the 'Followings' list
SocketClient.prototype.updateFollowingsList = function( followings ) {
	this.followings = followings;
};

// Update the 'Followers' list
SocketClient.prototype.updateFollowersList = function( followers ) {
	this.followers = followers;
};

module.exports = SocketClient;