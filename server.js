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

/*** 	BASE SETUP: Main objects & Dependencies 			*/

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



/*** 	APP LOGIC STARTS HERE 								*/


// Instantiates our 'Client Manager' object
var Manager = new sockClientManager();


/* 
**
**   	SOCKET IO - Manages each connection with the Client Manager object
**                        
*/ 
io.sockets.on('connection', function( socket ) {

	console.log("> New connection stablished: "+ socket.id);

	// Instantiate a new SocketClient instance
	var client = new sockClient( socket );

	// Manage the connection
	Manager.addClient( client );

});
