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
				//Self.joinFollowRooms( client );

				// Add the client to the clients array (will overwrite when existant)
				Self.clientList[client.username] = client;
				
				console.log();
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

		// We can do some validation here, we just make sure the 'username' goes to DB in lowercase
		var username = requestData.username.toLowerCase();
		var displayName = requestData.displayName;



		// Check if the username has already been taken
		Self.UserModel.findOne({ "username" : username }, function(err, existingUser) {
			if (err) {
				client.socket.emit('onSignUpError', { code : 500, description : err });
				return false;
			}

			// If the username already exists
			if ( existingUser != null ) {	
				client.socket.emit('onSignUpError', { code : 409, description : "Username '"+ username +"' is in use, please choose something else." });
				return false;
			}

			// Create the new User
			var user = new Self.UserModel();
			user.username = username;
			user.displayName = displayName;

			// Save the nwe User
			user.save(function(err) {
				if (err) {
					client.socket.emit('onSignUpError', { code : 500, description : err.msg });
					return false;
				}

				client.socket.emit('onSignUp', { username : user.username, displayName : user.displayName });
				client.socket.disconnect();
			});
		});
	});

	// @ getUserList 		- Gets a list of all registered users
	//	
	Self.addAuthEventListener(client, 'getUserList', function() {

		// Get all users from DB
		Self.UserModel.find({}, 'displayName')
			.exec(function(err, users) {
				if (err) {
					client.socket.emit('onGetUserListError', { code : 500, description : "Could not retrieve user list from server." });
					return false;
				}

				client.socket.emit('onGetUserList', users);
			});
	});

	// @ getUserProfile 	- Gets a user's profile  (default is current client's username)
	//
	Self.addAuthEventListener(client, 'getUserProfile', function( requestData ) {

		// If no username is given (for any reason) we'll look for (default) the client's profile
		var username = requestData.username != "" ? requestData.username.toLowerCase():client.username;

		// Get the specified user 
        Self.UserModel.findOne({ 'username' : username }).populate('tweets').exec(function(err, user) {
            if (err || user == null) {
				client.socket.emit('onGetUserProfileError', { code : 404 , description : "The requested profile '"+ username +"' was not found" });
				return false;
            }

           	client.socket.emit('onGetUserProfile', user);
        });

	});

	// @ followUser 		- Starts following a user
	//
	Self.addAuthEventListener(client, 'followUser', function( requestData ) {

		var username = requestData.username.toLowerCase();

        // Users cant follow themseves
        if (client.username === username) {
			client.socket.emit('onFollowUserError', { code : 403, description : "You cannot follow yoursef."});
			return false;
        }

        // Check if the client is already following this user
       	if ( client.followings.indexOf(username) > -1 ) {
			client.socket.emit('onFollowUserError', { code : 403, description : "You are already following '"+ requestData.username +"'."});
			return false;
       	}


		// Get the specified user from DB (we make sure it is a real user)
        Self.UserModel.findOne({ 'username' : username }, function(err, userToFollow) {

            if (err || userToFollow == null) {
				client.socket.emit('onFollowUserError', { code : 404 , description : "The requested profile '"+ username +"' was not found" });
				return false;
            }

			// Get for the CLIENT user on DB
	        Self.UserModel.findById(client._id, function(err, clientUser) {

	            if (err || userToFollow == null) {
					client.socket.emit('onFollowUserError', { code : 404 , description : err.message });
					return new Error(err);
	            }

	            // Update both DB Model and in-memory copy
	            clientUser.followings.push(userToFollow.username);
	            client.followings.push(userToFollow.username);

	            // Save client's user with new Following
	            clientUser.save(function(err) {
	            	if (err) {
						client.socket.emit('onFollowUserError', { code : 404 , description : err.message });
						return new Error(err);
	            	}

	            	// Update the new followed user's followers: because now $client is his new follower
	            	userToFollow.followers.push(client.username);
	            	userToFollow.save();

					// Respond emitting an event
					client.socket.emit('onFollowUser', userToFollow.username);
	            });
			});
        });
	});

	// @ unfollowUser 		- Stops following a user
	//
	Self.addAuthEventListener(client, 'unfollowUser', function( requestData ) {

		var username = requestData.username.toLowerCase();

        // Users cant follow themseves
        if (client.username === username) {
			client.socket.emit('onUnfollowUserError', { code : 403, description : "You cannot follow yoursef."});
			return false;
        }

        // Users can't unfollow someone who are NOT following
       	if (client.followings.indexOf(username) < 0) {
			client.socket.emit('onUnfollowUserError', { code : 403, description : "You are not following '"+ requestData.username +"'."});
			return false;
       	}

		// Get the specified user from DB (we make sure it is a real user)
        Self.UserModel.findOne({ 'username' : username }, function(err, userToUnfollow) {
            if (err || userToUnfollow == null) {
				client.socket.emit('onUnfollowUserError', { code : 404 , description : "The requested profile '"+ username +"' was not found" });
				return false;
            }

			// Get for the CLIENT user on DB
	        Self.UserModel.findById(client._id, function(err, clientUser) {

	            if (err || userToUnfollow == null) {
					client.socket.emit('onUnfollowUserError', { code : 404 , description : err.message });
					return new Error(err);
	            }

	            // Update both DB Model and in-memory copy
	            clientUser.followings.splice(clientUser.followings.indexOf(userToUnfollow.username));
	            client.followings.splice(client.followings.indexOf(userToUnfollow.username));

	            // Save client's user with new Following
	            clientUser.save(function(err) {
	            	if (err) {
						client.socket.emit('onUnfollowUserError', { code : 404 , description : err.message });
						return new Error(err);
	            	}

	            	// Update the unfollowed user's followers list - as $client is not following him anymore
	            	userToUnfollow.followers.splice( userToUnfollow.followers.indexOf(clientUser.username) );
	            	userToUnfollow.save();

					// Respond emitting an event
					client.socket.emit('onUnfollowUser', userToUnfollow.username);
	            });
			});
        });
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
			client.socket.emit('onCreateTweetError', { code : 400, description : 'Please enter a message post.'});
		}

		// Add the new Tweet message
		var newTweet = new Self.TweetModel();
		newTweet._creator = client._id;
		newTweet.datetime = Date.now();		
		newTweet.text = requestData.message;

		newTweet.save(function(err, tweet) {
			if (err) {
				client.socket.emit('onCreateTweetError', { code : 500, description : 'Could not create new Tweet.'});
				return false;
			}

			// Respond emitting an event
			client.socket.emit('onCreateTweet', tweet );

			// Emitimos un update para todos nuestros followers
			client.socket.to( client.username ).emit('onTimelineUpdated', tweet);			
		});

	});	
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