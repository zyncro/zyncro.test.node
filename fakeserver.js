'use strict';

var io = require('socket.io')(3000, {
    pingTimeout: 3000,
    pingInterval: 1500
});


io.on('connection', function(socket) {
    var _username = socket.handshake.query.username || null;

    if (_username) {
        socket.username = _username;

        socket.on('getTimeline', function(username){
            username = username || _username;

            console.log('timeline for ' + username);

            socket.emit('onGetTimeline', [{_id: '234234234234234', text: 'fistro duodenar'}]);
        });

    } else {
        socket.on('signUp', function(data) {
            socket.handshake.query.username = data.username;
            console.log('SignUp for ' + data.username);

            socket.emit('onSignUp', {
                username: data.username,
                displayName: data.displayName,
                followers: [],
                following: []
            });
        });
    }

    socket.on('disconnect', function() {
        console.log('user disconnected with socket ' + socket.id, new Date()
            .getTime());
    });

});

console.log('Fakeserver listening on port 3000');
