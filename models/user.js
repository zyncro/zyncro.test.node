
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


// Return the model
module.exports = mongoose.model('User', UserSchema);