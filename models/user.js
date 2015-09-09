
// Dependencies
var mongoose 	= require('mongoose');
var Schema 		= mongoose.Schema;

// Define the User Schema
var UserSchema = new mongoose.Schema({
	"username" : { "type" : String, unique: true },
	"displayName" : { "type" : String, required: true },
	"tweets" : [{ "type" : Schema.Types.ObjectId, "ref" : "Tweet" }],
    "followings" : [String],
    "followers" : [String]
});

Promise = require('bluebird');


UserSchema.statics.findByUsername = function(username, callback) {
    return this.findOne({ username : username }, callback);
};	


/* 	Creates a new User
**
**		data		Array { username : 'username', displayName : 'displayName' }
**      returns		The new created user @ Promise
*/ 
UserSchema.statics.createSignUp = function( data ) {	
	var Self = this;

	return new Promise(function(resolve, reject) {

		// Verificamos que el nombr de usuario no exista aún
		Self.findByUsername( data.username, function(err, user) {

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
	        		reject(err);
	        	}

	        	resolve(user);
	        });
		});
	});
};


// Return the model
module.exports = mongoose.model('User', UserSchema);