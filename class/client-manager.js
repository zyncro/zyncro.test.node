/* 		Client Manager Class
**
**		Manages client authentification and events
**
**		2015 - Eduardo Garcia Rajo
*/ 
'use string';

function ClientManager() {

	var Self			= this;
	Self.clientList 	= [];


	/* Until we have a DB Connection setted up, we'll stick to in-memory data */

	// Dummy timeline
	Self.tweets = [
		{ datetime: 1441560557686, username: "User1", message: "Hello this is 'User1's Tweet..." },
		{ datetime: 1441560557676, username: "User2", message: "Hello this is 'User2's Tweet..." },
		{ datetime: 1441560557666, username: "User3", message: "Hello this is 'User3's Tweet..." },
		{ datetime: 1441560557656, username: "User4", message: "Hello this is 'User4's Tweet..." },
		{ datetime: 1441560557646, username: "User5", message: "Hello this is 'User5's Tweet..." },
		{ datetime: 1441560557636, username: "User6", message: "Hello this is 'User6's Tweet..." },
		{ datetime: 1441560557626, username: "User7", message: "Hello this is 'User7's Tweet..." }
	];

	// Dummy user list
	Self.userList = [
			{ username : "User1", displayName : "Pepe", following : ["User2","User3","User4"], followers : ["User2","User3","User4","User8"] },
			{ username : "User2", displayName : "Jose", following : ["User1","User3"], followers : ["User1","User3"] },
			{ username : "User3", displayName : "Ernesto", following : ["User1","User2"], followers : ["User1","User2"] },
			{ username : "User4", displayName : "Andres", following : [], followers : [] },
			{ username : "User5", displayName : "Ricardo", following : [], followers : [] },
			{ username : "User6", displayName : "Manuel", following : [], followers : [] },
			{ username : "User7", displayName : "Fabian", following : [], followers : [] },
			{ username : "User8", displayName : "Pedro", following : [], followers : [] }
		];
};


/* 		Searches for a user / profile with the given 'username'
**
**		username: 			User Profile name to look for
**      returns:   			A user profile / False if not found
**
*/ 
ClientManager.prototype.userSearch = function ( username ) {
	var Self = this;

	for (var i=0; i<Self.userList.length; i++) {
		if ( Self.userList[i].username.toLowerCase() == username.toLowerCase() ) {
			return Self.userList[i];
		}
	}

	return false;
};

/* 		Will authentificate and add a new client
**
**		client:             An instance of 'SocketClient' object
**                 
*/ 
ClientManager.prototype.addClient = function( client ) {
	var Self = this;

	// Authentificate and add to Clients Array
	if ( Self.authentificate( client )) {

		// Add the client to the clients array (will overwrite when existant)
		Self.clientList[client.username] = client;

		// Create the client's room
		client.socket.join( client.username );

		// Get the user profile and save followings and followers in memory
		var profile = Self.userSearch( client.username );
		client.followings = profile.following;
		client.followers = profile.followers;

		// Join to our online followings / followers
		Self.joinFollowRooms( client );
	}


	// Bind events to the new client
	 this.bindEvents( client );
};


/* 		Bind all the basic events to the given client socket
**
**		client:             An instance of 'SocketClient' object
**                 
*/ 
ClientManager.prototype.joinFollowRooms = function( client ) {
	var Self = this;

	// Look for online followings and join their rooms to receive updates
	for (var i in client.followings) {

		if ( Self.clientList[client.followings[i]] ) {
			client.socket.join( client.followings[i] );
		}
	}

	// Look for online followers and join them to the client's room
	for (var i in client.followings) {

		if ( typeof Self.clientList[client.followings[i]] !== 'undefined') {
			console.log("Follower "+ client.followings[i] +" está online!");
			Self.clientList[client.followings[i]].socket.join( client.username );
		}
	}
}


/* 		Bind all the basic events to the given client socket
**
**		client:             An instance of 'SocketClient' object
**                 
*/ 
ClientManager.prototype.bindEvents = function( client ) {
	var Self = this;

	// @ Disconnect
	//	
	client.socket.on('disconnect', function() {
		console.log("-> Client disconnected.");

		// Si el cliente esta en mi lista the Auth Clients, lo remuevo
		if ( client.auth ) {
			delete Self.clientList[client.username];
		}
	});	

	// @ SignUp 			- Creates new users
	//
	client.socket.on('signUp', function( requestData ) {
		console.log("> Event triggered: 'signUp' @ " + client.socket.id );


		// Only non-signed up users may create new accounts
		if ( client.auth ) {
			client.socket.emit('onSignUpError', {code: 403, description:'You already have an account.'});
			return false;
		}

		// Validate de requested new 'username'
		for (var i=0; i<Self.userList.length; i++) {

			if ( Self.userList[i].username == requestData.username ) {
				client.socket.emit('onSignUpError', {code: 409, description:'Username already exist, please choose something else.'});
				return false;
			}

		}

		// Add the new user and respond to the client before disconnecting
		var newUser = { username : requestData.username, displayName : requestData.displayName };
		Self.userList.push(newUser);

		client.socket.emit('onSignUp', newUser);

		client.socket.disconnect();
	});

	// @ getUserList 		- Gets a list of all registered users
	//	
	Self.addAuthEventListener(client, 'getUserList', function() {

		// Send the user's list
		if ( Self.userList.length > 0 ) {
			client.socket.emit( 'onGetUserList', Self.userList );
		} else {
			client.socket.emit( 'onGetUserListError', { code:500, description: "Could not retrieve user list from server." });
		}

	});

	// @ getUserProfile 	- Gets a user's profile  (default is current client's username)
	//
	Self.addAuthEventListener(client, 'getUserProfile', function( requestData ) {

		var profile = null;
		if ( !(profile = Self.userSearch(requestData.username || client.socket.username)) ) {
			client.socket.emit('onGetUserProfileError', { code:404, description:'The requested profile was not found'});
			return false;
		}

		client.socket.emit('onGetUserProfile', profile);
	});

	// @ followUser 		- Starts following a user
	//
	Self.addAuthEventListener(client, 'followUser', function( requestData ) {

		if ( requestData.username in client.followings ) {
			client.socket.emit('onFollowUserError', { code : 403, description : "You are already following "+ requestData.username +"."});
			return false;
		}

		// Respond emitting an event
		client.socket.emit('onFollowUser', { username : requestData.username });
	});

	// @ unfollowUser 		- Stops following a user
	//
	Self.addAuthEventListener(client, 'unfollowUser', function( requestData ) {
		if ( !requestData.username in client.followings ) {
			client.socket.emit('onFollowUserError', { code : 403, description : "You are not following "+ requestData.username +"."});
		}
		// Respond emitting an event
		client.socket.emit('onUnfollowUser', requestData.username);
	});	

	// @ getTimeline 		- Gets the timeline of a username (default is client's)
	//
	Self.addAuthEventListener(client, 'getTimeline', function( requestData ) {

		// Respond emitting an event
		client.socket.emit('onGetTimeline', Self.tweets);
	});	

	// @ createTweet 			- Posts a new Tweet 
	//
	Self.addAuthEventListener(client, 'createTweet', function( requestData ) {

		// Validate user input
		if ( typeof requestData.message === 'undefined' || requestData.message === '' ) {
			client.socket.emit('onCreateTweetError', { code : 400, description : 'Please specify a message body.'});
		}

		// Create the new Tweet
		var tweet = {
			datetime : Date.now(),
			username : client.username,
			message : requestData.message
		};

		// Simulamos la posibilidad de error
		if ( !Self.tweets.push( tweet ) ) {
			client.socket.emit('onCreateTweetError', { code : 500, description : 'Could not append a new Tweet.'});
		}

		// Emitimos un update para todos nuestros followers
		client.socket.to( client.username ).emit('onTimelineUpdated', tweet);

		// Respond emitting an event
		client.socket.emit('onCreateTweet', tweet );
	});	
};


/* 		Authentificates a socket connection by retrieving it's query.username value
**		When a connection is authentificated, we set it up as a new client connection
**		'username' must also exist
**
**		client:             An instance of 'SocketClient' object
**                 
*/ 
ClientManager.prototype.authentificate = function( client ) {
	var Self = this;
	var profile = [];

	// If we got 'username' within the query
	if ( client.username ) {

		// If the received 'username' corresponds to an existing profile
		if ( (profile = Self.userSearch( client.username )) ) {

			// The client may input he's username with different case, we make sure that the session has the correct case
			client.username = profile.username;

			// Set client as authentificated
			client.auth = true;

		} else {

			console.log("> Requested username '"+ client.username +"' unexistant.");
			client.socket.disconnect();
			return new Error({ code: 404, description: "The requested user does not exist."});
		}
	}

	// Return AUTH status
	return client.auth;
};


/*		Adds listeners that require a 'username' passed by query string.
**
**		client:             An instance of 'SocketClient' object
**		fnCallback:   		The actual callback function to be binded
**                        
*/ 
ClientManager.prototype.addAuthEventListener = function( client, event, fnCallback ) {

    client.socket.on(event, function( requestData ) {
		console.log("-> Event triggered: '"+ event +"' @ " + client.socket.id);

		// Is this an authentificated socket?
        if ( client.auth ) {
			return fnCallback.apply(this, arguments);
		}

		// Disconnect unathorized clients
		console.log("---> Authentification failed!");
		client.socket.disconnect();
		return new Error("{ code: 403, description: 'You must specify a username in your query' }");  
    });
}

module.exports = ClientManager;