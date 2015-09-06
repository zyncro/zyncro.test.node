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

var express 			= require('express');
var app 				= express();
var http 				= require('http');
var server 				= http.createServer(app);
var io 					= require('socket.io');
var sockClient 			= require('./class/client');
var sockClientManager	= require('./class/client-manager');

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



/*		Instantiate the Client Manager object
**
**		We pass the in-memory user list right now because we don't have DB connection yet
**      (After we get a DB we can pass a model / DAO reference here)
*/ 
var Manager = new sockClientManager( userList );



/* 
**
**   	SOCKET IO EVENTS
**                        
*/ 
io.sockets.on('connection', function( socket ) {

	console.log("> New connection stablished: "+ socket.id);


	/***	STAGE 1 - Process and handle incoming connections	***************/


	// Create a new SocketClient instance
	var client = new sockClient( socket );

	// Add (process) the new client
	Manager.addClient( client );



});
