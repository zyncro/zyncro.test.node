
// Dependencies
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


// Define the Tweet Schema
var TweetSchema = new mongoose.Schema({
	"_creator" : { "type": Schema.Types.ObjectId, "ref" : "User" },
	"datetime" : { "type" : Date, "default" : Date.now },
	"text" : { "type": String }
});


// Return the model
module.exports = mongoose.model('Tweet', TweetSchema);