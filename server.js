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
		{ username : "User1", display_name : "Pepe" },
		{ username : "User2", display_name : "Jose" },
		{ username : "User3", display_name : "Ernesto" },
		{ username : "User4", display_name : "Andres" },
		{ username : "User5", display_name : "Ricardo" },
		{ username : "User6", display_name : "Manuel" },
		{ username : "User7", display_name : "Fabian" },
		{ username : "User8", display_name : "Pedro" }
	];




/*
 * A dummy socket validation function.
 * We look for 'username' inside the connection query and also check if it's null,
 * if it is, then we close the refuse service clossing the connection.
 *
 */
var validateQuery = function(socket, next) {	

	console.log("> Verifying username...");

	if ( typeof socket.handshake.query.username  === 'undefined' || socket.handshake.query.username === "" ) {
		console.log("-> Authentification failed!");
		socket.disconnect();
		return next(new Error("{ code: 403, description: 'You must specify a username in your query' }"));
	}
};



/*** SOCKET IO Events									*/

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
		console.log("> Triggered 'signUp' @ " + socket.id);
		socket.emit('onSignUp', { username : requestData.username, displayName : requestData.displayName });
		socket.disconnect();
	});


	// @ getUserList 		- Gets a list of all registered users
	//	
	socket.on('getUserList', function( requestData ) {

		console.log("> Triggered 'userList' @ " + socket.id);
		
		// Validate query
		validateQuery(socket);

		// Send the user's list
		socket.emit( 'onGetUserList', userList );

	});


	// @ getUserProfile 	- Gets a user's profile. Will return the requester's profile if none specified
	//	
	socket.on('getUserProfile', function( requestData ) {
		
		console.log("> Triggered 'getUserProfile' @ " + socket.id);

		// Validate username
		validateQuery(socket);

		// For now we just send a dummy profile
		var userProfile = { username : "User1", display_name : "Pepe" };
		socket.emit('onGetUserProfile', userProfile);
	});

});
