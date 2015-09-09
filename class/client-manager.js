/* 		Client Manager Class
**
**		Manages client authentification and events
**
**		2015 - Eduardo Garcia Rajo
*/ 
'use string';

function ClientManager( UserModel, TweetModel ) {

	var Self			= this;
	Self.clientList 	= [];
	Self.UserModel 		= UserModel;
	Self.TweetModel		= TweetModel;
};


/* 		Will authentificate, setup and add a new client
**
**		client:             An instance of 'SocketClient' object
**                 
*/ 
ClientManager.prototype.addClient = function( client ) {
	var Self = this;

	// Authentificate and setup the client object
	if ( client.username ) {

		// May do some validation her, for now just move the string to lowercase
		var username = client.username.toLowerCase();

		// Look for the user in the DB
	    Self.UserModel.findOne({ username : username })
	    	.exec(function(err, userProfile) {
	        
		    	// If username was not found...
		        if (err) {
					client.socket.disconnect();
					console.log(err.message);
					return new Error(err);
		        }

		        if (!userProfile) {
					console.log("> Requested username '"+ client.username +"' unexistant.");
					return new Error("Requested username '"+ client.username +"' unexistant.");
		        }




		        /** CLIENT SETUP **/

				// Set client as authentificated
				client.auth = true;

				// Save the user ID in memory
				client._id = userProfile._id;

				// Set the client's username
				client.username = userProfile.username;

				// Following / Followers
				client.followings = userProfile.followings;
				client.followers = userProfile.followers;

				// Create the client's room
				client.socket.join( client.username );

				// Join to our online followings / followers
				Self.joinFollowRooms( client );

				// Add the client to the clients array (will overwrite when existant)
				Self.clientList[client.username] = client;

				// Make sure we'll remove the client's from the server-side client list when it disconnects
				client.socket.on('disconnect', function() {
					console.log("> Client '"+ client.username +"' removed.");
					delete Self.clientList[client.username];
				});
		});

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

	// Check if we received an authorized client
	if ( !client.auth ) {
		return false;
	}

	// Look for online followings and join their rooms to receive updates as push notifications
	for (var i=0; i<client.followings.length; i++) {

		if ( typeof Self.clientList[client.followings[i]] !== 'undefined' ) {
			client.socket.join( client.followings[i] );
			console.log("- User '"+ client.username +"' joined "+ client.followings[i] +"'s room.");
		}
	}

	// Look for online followers and join them to the client's room
	for (var i=0; i<client.followers.length; i++) {

		if ( typeof Self.clientList[client.followers[i]] !== 'undefined' ) {
			Self.clientList[client.followers[i]].socket.join( client.username );
			console.log("-- User '"+ client.followers[i] +"' joined "+ client.username +"'s room.");
		}
	}
}


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
		client.socket.emit('error', new Error("{ code: 403, description: 'You must specify a username in your query' }"));
		return new Error("{ code: 403, description: 'You must specify a username in your query' }");  
    });
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

		// Prepare and send the request to the Model
		var userData = { username : requestData.username.toLowerCase(), displayName : requestData.displayName };

		Self.UserModel.createSignUp( userData )
			.then(function(user) {

				console.log("> New user created successfully, disconnecting.");

				client.socket.emit('onSignUp', { username : user.username, displayName : user.displayName });
				client.socket.disconnect();

			}).catch(function(err) {

				console.log("An error ocurred: ", err);

				client.socket.emit('onSignUpError', { code : 409, description : err.message });
			});
	});

	// @ getUserList 		- Gets a list of all registered users
	//	
	Self.addAuthEventListener(client, 'getUserList', function() {

		// Look for all registered users on DB
		Self.UserModel.findAllUsers()
			.then(function(users) {

				console.log("> Successfully got all users from DB.");

				client.socket.emit('onGetUserList', users);

			}).catch(function(err) {

				console.log("An error ocurred: ", err);

				client.socket.emit('onGetUserListError', { code : 500, description : err.message });
			});
	});

	// @ getUserProfile 	- Gets a user's profile  (default is current client's username)
	//
	Self.addAuthEventListener(client, 'getUserProfile', function( requestData ) {

		// If no username is given use client's (default)
		var username = requestData.username != "" ? requestData.username.toLowerCase():client.username;

		Self.UserModel.getProfile( username )
			.then(function(users) {

				console.log("> Successfully got user '"+ username +"'s profile.");

				client.socket.emit('onGetUserProfile', users);

			}).catch(function(err) {

				console.log("An error ocurred: ", err);

				client.socket.emit('onGetUserProfileError', { code : 500, description : err.message });
			});
	});

	// @ followUser 		- Starts following a user
	//
	Self.addAuthEventListener(client, 'followUser', function( requestData ) {

		var username = requestData.username.toLowerCase();

        // Users cant follow themselves
        if (client.username === username) {
			client.socket.emit('onFollowUserError', { code : 403, description : "You cannot follow yoursef."});
			return false;
        }

        // Check if the client is already following this user
       	if ( client.followings.indexOf(username) > -1 ) {
			client.socket.emit('onFollowUserError', { code : 403, description : "You are already following '"+ requestData.username +"'."});
			return false;
       	}

       	// Prepare the request
       	var data = { follower : client.username, followed : username };

       	Self.UserModel.followUser( data )
			.then(function(response) {

				console.log("> Successfully following user '"+ data.followed +".");

				// Update the client object with the new Followings array
				client.updateFollowingsList( response );

	            // We may join the new followed user's room if he is online (to receive pushes)
	            if ( typeof Self.clientList[data.followed] !== 'undefined' ) {
	            	client.socket.join( data.followed );
	            }

	            // Finally emit the response event
				client.socket.emit('onFollowUser', response);

			}).catch(function(err) {

				console.log("An error ocurred: ", err);

				client.socket.emit('onFollowUserError', { code : 500, description : err.message });
			});
	});

	// @ unfollowUser 		- Stops following a user
	//
	Self.addAuthEventListener(client, 'unfollowUser', function( requestData ) {

		var username = requestData.username.toLowerCase();

        // Users cant follow themseves
        if (client.username === username) {
			client.socket.emit('onUnfollowUserError', { code : 403, description : "You cannot unfollow yoursef."});
			return false;
        }

        // Users can't unfollow someone who are NOT following
       	if (client.followings.indexOf(username) < 0) {
			client.socket.emit('onUnfollowUserError', { code : 403, description : "You are not following '"+ requestData.username +"'."});
			return false;
       	}

       	// Prepare the request
       	var data = { follower : client.username, followed : username, reverse : true };

       	Self.UserModel.followUser( data )
			.then(function(response) {

				console.log("> Successfully unfollowing user '"+ data.followed +".");

				// Update the client object with the new Followings array
				client.updateFollowingsList( response );

	            // We may join the new followed user's room if he is online (to receive pushes)
	            if ( typeof Self.clientList[data.followed] !== 'undefined' ) {
	            	client.socket.leave( data.followed );
	            }

	            // Finally emit the response event
				client.socket.emit('onUnfollowUser', response);

			}).catch(function(err) {

				console.log("An error ocurred: ", err);

				client.socket.emit('onUnfollowUserError', { code : 500, description : err.message });
			});
	
	});

	// @ getTimeline 		- Gets the timeline of a username (default is client's)
	//
	Self.addAuthEventListener(client, 'getTimeline', function( requestData ) {
		// If no username is given use client's (default)
		var username = requestData.username != "" ? requestData.username.toLowerCase():client.username;

		// Get the requested user's timeline
		Self.UserModel.getTimeline( username )
			.then(function(tweets) {

				console.log("> Successfully got user '"+ username +"'s timeline.");

				// Respond emitting an event
				client.socket.emit('onGetTimeline', tweets);

			}).catch(function(err) {

				console.log("An error ocurred: ", err);

				client.socket.emit('onGetTimelineError', { code : 500, description : err.message });
			});
	});	

	// @ createTweet 			- Posts a new Tweet 
	//
	Self.addAuthEventListener(client, 'createTweet', function( requestData ) {

		// If the user is unexistent
		if ( typeof requestData.text !== 'string' || requestData.text.length < 1 ) {
			client.socket.emit('onCreateTweetError', { code : 400, description : "You must enter a valid text to tweet." });
			return false;
        }

		var tweetData = { username : client.username, text : requestData.text };

		Self.UserModel.createUserTweet( tweetData )
			.then(function(tweet) {

				console.log("> Successfully posted new Tweet by user '"+ tweetData.username +".");

				// Emit to OWNER
				client.socket.emit('onCreateTweet', tweet);

				// Emit to FOLLOWERS
				client.socket.to( client.username ).emit('onTimelineUpdated', tweet);

			}).catch(function(err) {

				console.log("An error ocurred: ", err);

				client.socket.emit('onCreateTweetError', { code : 500, description : err.message });
			});
	});	
};

module.exports = ClientManager;