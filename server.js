/*
 *
 *	Twitter-like realtime server project for "Zyncro"
 *
 *	Author: Eduardo Garcia Rajo - eduugr@gmail.com
 *	
 *	Fri 4 Sep 2015
 *
 */

'use strict';


/*** BASE SETUP: Main objects & Dependencies 			*/

var express 	= require('express');
var app 		= express();
var http 		= require('http');
var server 		= http.createServer(app);
var io 			= require('socket.io');

// Set port in which the server will listen
var port = process.env.PORT || 3000;


// I'm doing some tests directly from HTML/JS files, this will be removed later...
app.use(express.static(__dirname + "/public"));


// Start servers (HTTP is temporal and just for personal tests...)
var io = io.listen(server);
server.listen(port, function() {
  console.log('>> Express server listening on port ' + port + ' <<');
});



/*** APP LOGIC STARTS HERE 								*/

// Dummy user list
var userList = [
		{ username : "User1", displayName : "Pepe" },
		{ username : "User2", displayName : "Jose" },
		{ username : "User3", displayName : "Ernesto" },
		{ username : "User4", displayName : "Andres" },
		{ username : "User5", displayName : "Ricardo" },
		{ username : "User6", displayName : "Manuel" },
		{ username : "User7", displayName : "Fabian" },
		{ username : "User8", displayName : "Pedro" }
	];

// Dummy timeline - Once we mount the MongoDB we'll change 'username' for a @ref to a user document
var timeline = [
	{ datetime: "2015-09-04 00:00:01", username: "User1", message: "Hello this is 'User1's Tweet..." },
	{ datetime: "2015-09-04 00:00:01", username: "User2", message: "Hello this is 'User2's Tweet..." },
	{ datetime: "2015-09-04 00:00:01", username: "User3", message: "Hello this is 'User3's Tweet..." },
	{ datetime: "2015-09-04 00:00:01", username: "User4", message: "Hello this is 'User4's Tweet..." },
	{ datetime: "2015-09-04 00:00:01", username: "User5", message: "Hello this is 'User5's Tweet..." },
	{ datetime: "2015-09-04 00:00:01", username: "User6", message: "Hello this is 'User6's Tweet..." },
	{ datetime: "2015-09-04 00:00:01", username: "User7", message: "Hello this is 'User7's Tweet..." }
];


/* Adds listeners that require an 'username' passed by query string.
**
**    socket:             socket to wich the event will be binded
**    username:           client's username
**    fnCallback:   		the actual callback function to be binded
**                        
*/ 
function addAuthEventListener(socket, event, fnCallback) {

    socket.on(event, function (requestData) {

		console.log("-> Event triggered: '"+ event +"' @ " + socket.id);

        if ( typeof socket.handshake.query.username  === 'undefined' || socket.handshake.query.username === "" ) {

			console.log("---> Authentification failed!");
			socket.disconnect();
			return new Error("{ code: 403, description: 'You must specify a username in your query' }");

        } else {

            return fnCallback.apply(this, arguments)
        }        
    });
}



/* 
**
**   	SOCKET IO EVENTS
**                        
*/ 
io.sockets.on('connection', function(socket) {

	console.log("> New connection stablished: "+ socket.id);


	// @ Disconnect
	//	
	socket.on('disconnect', function() {
		// clients.splice(clients.indexOf(socket.id), 1);
		console.log("-> Client disconnected.");
	});	


	// @ SignUp 			- Creates new users
	//
	socket.on('signUp', function( requestData ) {

		// Rough test, will change... don't worry :)
		if ( {username : requestData.username, displayName : requestData.displayName} in userList ) {
			return new Error("{ code: 500, description: 'User already exist.' }");
		}

		console.log("> Event triggered: 'signUp' @ " + socket.id );
		socket.emit('onSignUp', { username : requestData.username, displayName : requestData.displayName });
		socket.disconnect();

	});


	// @ getUserList 		- Gets a list of all registered users
	//	
	addAuthEventListener(socket, 'getUserList', function() {

		// Send the user's list
		socket.emit( 'onGetUserList', userList );
	});


	// @ getUserProfile 	- Gets a user's profile  (default is client's)
	//
	addAuthEventListener(socket, 'getUserProfile', function( requestData ) {

		// Respond emitting an event (using a dummy profile for now)
		socket.emit('onGetUserProfile', userList[4]);
	});


	// @ followUser 		- Starts following a user
	//
	addAuthEventListener(socket, 'followUser', function( requestData ) {

		// Respond emitting an event
		socket.emit('onFollowUser', requestData.username);
	});


	// @ unfollowUser 		- Stops following a user
	//
	addAuthEventListener(socket, 'unfollowUser', function( requestData ) {

		// Respond emitting an event
		socket.emit('onUnfollowUser', requestData.username);
	});	


	// @ getTimeline 		- Gets the timeline of a username (default is client's)
	//
	addAuthEventListener(socket, 'getTimeline', function( requestData ) {

		// Respond emitting an event
		socket.emit('onGetTimeline', timeline);
	});	

	// @ postTweet 			- Posts a new Tweet 
	//
	addAuthEventListener(socket, 'postTweet', function( requestData ) {

		// Respond emitting an event
		socket.emit('onPostTweet', timeline[0]);
	});	

});
