
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
				reject( new Error(err.message ) );
			}

			// If the username is in use we should reject the request
			if (user) {
	        	reject( new Error("The username '"+ data.username +"' is already in use.") );
	        }

	        // Prepare the new user data
	        var user = new Self;
	        user.username = data.username;
	        user.displayName = data.displayName;

	        // Save the new user and resolve if ok
	        user.save(function(err, user) {

	        	if (err) {
	        		reject( new Error(err.message) );
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
	        	reject( new Error(err.message) );
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
	        	reject( new Error(err.message) );
	        }

	        // If the user does not exist
			if (!user) {
	        	reject( new Error("The specified profile '"+ username +"' was not found.") );

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

		if ( typeof data === 'undefined' || data.followed.length < 1 || data.follower.length < 1  ) {
			reject( new Error("You must specify who to follow.") );
		}

		// Si el flag está levantado, entonces hacemos UNfollow
		var flag = data.reverse === true ? true:false;

		// Verifies that the given username (to be followed) exists in DB
		Self.findByUsername( data.followed, false, function(err, userToFollow) {

			if (err) {
				reject( new Error(err.message) );
			}

			// If the user is unexistent

			if (userToFollow === null) {
	        	reject( new Error("The username '"+ data.followed +"' does not exist.") );
	        	return false;
	        }


			// The uto be followed user exists, get the follower's user
			Self.findByUsername( data.follower, false, function(err, userThatFollows) {

				if (err) {
					reject( new Error(err.message) );
				}

				// If the user is unexistent
				if (!userThatFollows) {
	        		reject( new Error("The username '"+ data.follower +"' does not exist.") );
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


/* 	Creates a new Tweet from the requested user's model
**
**		data 			Object			Config [{ username : 'username', text : 'tweeter text' }]
**      returns			Object 			A 'Tweet' object @ Promise
**
*/ 
UserSchema.statics.createUserTweet = function( data ) {
	var Self = this;

	return new Promise(function(resolve, reject) {

		// Looks for the user (it should exist)
		Self.findByUsername( data.username, true, function(err, user) {

			if (err) {
	        	reject( new Error(err.message) );
	        }

	        // If the user does not exist
			if (!user) {
	        	reject( new Error("The specified profile '"+ data.username +"' was not found.") );
	        }

	        // Create the new tweet
	        user.createTweet( data.text )
	        	.then(function(tweet) {

	        		// Return the Tweet object
			        resolve(tweet);
	        	})
	        	.catch(function(err) {
					if (err) {
			        	reject( new Error(err.message) );
			        }
	        	});
		});
	});
};


/* 	Gets the Timeline for a given username
**
**		username		Object			Username of the timeline request
**      returns			Object 			An object representing the user's timeline
**
*/ 
UserSchema.statics.getTimeline = function( username ) {
	var Self = this;

	return new Promise(function(resolve, reject) {

		Self.findByUsername(username, true, function(err, user) {

			if (err) {
	        	reject( new Error(err.message) );
	        }

	        // If the user does not exist
			if (!user) {
	        	reject( new Error("The specified profile '"+ data.username +"' was not found.") );
	        }

	        resolve(user.tweets);
	    });
	});
};



/*******************************************

		MODEL INSTANCE METHODS

********************************************/



/* 	Creates a new Tweet message
**
**		text 			String			Text message to post
**      returns			Object 			A 'Tweet' object @ Promise
**
*/ 
UserSchema.methods.createTweet = function( text ) {	
	var Self = this;

	return new Promise(function(resolve, reject) {

		// Creates the new Tweet message
		var TweetModel = Self.model('Tweet');
		var tweet = new TweetModel();
		tweet.text = text;
		tweet._creator = Self._id;

		TweetModel.populate(tweet, {path:"_creator",select: 'username displayName'}, function(err, tweet) { console.log(tweet); });

		// Saves the new Tweet
		tweet.save(function(err, tweet) {

			if (err) {
				reject( new Error(err.message ) );
			}

			// Pushes the tweet into the user's tweets array
			Self.tweets.push(tweet);

			// Saves the user's document and returns the tweet object
			Self.save(function(err, user) {

				if (err) {
					reject( new Error(err.message) );
				}

				// Return the Tweet object
				resolve(tweet);
			});
		});

	});
};



/*******************************************

			MODEL VALIDATION

********************************************/



var User = mongoose.model('User', UserSchema)

// USERNAME 
User.schema.path('username').validate(function (value) {
	return /^[a-zA-Z0-9\ñ\Ñ\ñ\Ñ\á\é\í\ó\ú\Á\É\Í\Ó\Ú]{1,32}$/i.test(value);
}, 'Invalid username: alphanumerical characters only.');


// DISPLAY NAME
User.schema.path('displayName').validate(function (value) {
	return /^[a-zA-Z0-9\ñ\Ñ\á\é\í\ó\ú\Á\É\Í\Ó\Ú\s]{1,64}$/i.test(value);
}, 'Invalid display name: no special characters please.');


// Export
module.exports = User;