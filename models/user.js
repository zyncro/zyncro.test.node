
// Dependencies
var mongoose 	= require('mongoose');
var Schema 		= mongoose.Schema;
var Promise 	= require('bluebird');


// Define the User Schema
var UserSchema = new mongoose.Schema({
	"username" : { "type" : String, unique: true },
	"displayName" : { "type" : String, required: true },
	"tweets" : [{ "type" : Schema.Types.ObjectId, "ref" : "Tweet" }],
    "followings" : [String],
    "followers" : [String]
});



/*******************************************

		MODEL STATIC METHODS

********************************************/

/* 	Searches for a user with the specified username
**
**		username 		String			'username' to look for
**		populated		Boolean			Populate tweets, followers and followings
**      returns			function 		A callback function
**
*/ 
UserSchema.statics.findByUsername = function(username, populate, callback) {
	return populate ? this.findOne({ username : username }, callback).populate('tweets') : this.findOne({ username : username }, callback);
};	


/* 	Creates a new User
**
**		data			Object 			Config [{ username : 'username', displayName : 'displayName' }]
**      returns			Object			The new created user @ Promise
**
*/ 
UserSchema.statics.createSignUp = function( data ) {	
	var Self = this;

	return new Promise(function(resolve, reject) {

		// Verificamos que el nombr de usuario no exista aún
		Self.findByUsername( data.username, false, function(err, user) {

			if (err) {
				reject( new Error({ code : 500, description : err.message }) );
			}

			// If the username is in use we should reject the request
			if (user) {
	        	reject( new Error({ code : 409, description : "The username '"+ data.username +"' is already in use." }) );
	        }

	        // Prepare the new user data
	        var user = new Self;
	        user.username = data.username;
	        user.displayName = data.displayName;

	        // Save the new user and resolve if ok
	        user.save(function(err, user) {
	        	if (err) {
	        		reject( new Error({ code : 500, description : err.message }) );
	        	}

	        	resolve(user);
	        });
		});
	});
};

/* 	Gets the complete users list
**
**      returns			Object Array	An array of unpopulated 'User' objects @ Promise
**
*/ 
UserSchema.statics.findAllUsers = function() {	
	var Self = this;

	return new Promise(function(resolve, reject) {

		// Verificamos que el nombr de usuario no exista aún
		Self.find({}, function(err, users) {

			if (err) {
	        	reject( new Error({ code : 500, description : err.message }) );
	        }

	        // Will return all users found
			resolve(users);
		});
	});
};

/* 	Gets a user profile
**
**		username 		String			String representing the username of the requested profile
**      returns			Object 			A populated 'User' object @ Promise
**
*/ 
UserSchema.statics.getProfile = function( username ) {	
	var Self = this;

	return new Promise(function(resolve, reject) {

		// Verificamos que el nombr de usuario no exista aún
		Self.findByUsername( username, true, function(err, user) {

			if (err) {
	        	reject( new Error({ code : 500, description : err.message }) );
	        }

	        // If the user does not exist
			if (!user) {
	        	reject( new Error({ code : 404, description : "The specified profile '"+ username +"' was not found." }) );

	        }

	        // Will return a populanewted User object
			resolve(user);
		});
	});
};


/* Stablishes a Follow relation between two users
**
**		data			Object 			Config [{ follower : 'username', followed : 'username', reverse : false }]
**										NOTE: use 'data.reverse : true' to unfollow
**      returns			Array 			An updated Followings list @ Promise
**
*/ 
UserSchema.statics.followUser = function( data ) {	
	var Self = this;

	return new Promise(function(resolve, reject) {

		// Si el flag está levantado, entonces hacemos UNfollow
		var flag = data.reverse === true ? true:false;

		// Verifies that the given username (to be followed) exists in DB
		Self.findByUsername( data.followed, false, function(err, userToFollow) {

			if (err) {
				reject( new Error({ code : 500, description : err.message }) );
			}

			// If the user is unexistent
			if (!userToFollow) {
	        	reject( new Error({ code : 404 , description : "The username '"+ data.followed +"' does not exist." }) );
	        }

			// The uto be followed user exists, get the follower's user
			Self.findByUsername( data.follower, false, function(err, userThatFollows) {

				if (err) {
					reject(new Error({ code : 500, description : err.message }));
				}

				// If the user is unexistent
				if (!userThatFollows) {
	        		reject( new Error({ code : 404 , description : "The username '"+ data.follower +"' does not exist." }) );
		        }

		        // Update the fields that relates both uers as follower/followed
		        var resp = [];

		        if ( flag ) {
			        userToFollow.followers.splice( userToFollow.followers.indexOf(userThatFollows.username) );
			        userThatFollows.followings.splice( userThatFollows.followings.indexOf(userToFollow.username) );

		        } else {

			        userToFollow.followers.push( userThatFollows.username );
			        userThatFollows.followings.push( userToFollow.username );
		        }

		        userToFollow.save();
		        userThatFollows.save();

		        // Return the updated 'followd' array (to update the client object)
				resolve( userThatFollows.followings );
			});
		});

	});
};


module.exports = mongoose.model('User', UserSchema);