
'use string';

function Client( socket ) {

	var Self 		= this;
	Self.socket 	= socket;
	Self.query		= socket.handshake.query;	
	Self.username 	= typeof Self.query.username !== 'undefined' || Self.query.username !== "" ? Self.query.username:null;
	Self.auth 		= false;

};







module.exports = Client;