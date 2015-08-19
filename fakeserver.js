'use strict';

var io = require('socket.io')(3000, {
    pingTimeout: 3000,
    pingInterval: 1500
});

var users = [];

var createUsers = function(numberOfUsers) {
    for (var i = 1; i <= numberOfUsers; i++) {
        users.push({
            username: 'user' + i,
            displayName: 'Name USER' + i,
            followers: [],
            following: []
        });
    }
};


io.on('connection', function(socket) {
    var _username = socket.handshake.query.username || null;
    console.log('user connected with socket ' + socket.id, new Date()
        .getTime());

    if (_username) {
        socket.username = _username;

        socket.on('getTimeline', function(username) {
            username = username || _username;

            console.log('timeline for ' + username);

            socket.emit('onGetTimeline', [{
                _id: '234234234234234',
                text: 'fistro duodenar'
            }]);
        });

        socket.on('getUserList', function(){
            socket.emit('onGetUserList', users);
        });

    } else {
        socket.on('signUp', function(data) {
            socket.handshake.query.username = data.username;
            console.log('SignUp for ' + data.username);

            var newUser = {
                username: data.username,
                displayName: data.displayName,
                followers: [],
                following: []
            };

            users.push(newUser);

            socket.emit('onSignUp', newUser);
        });
    }

    socket.on('disconnect', function() {
        console.log('user disconnected with socket ' + socket.id, new Date()
            .getTime());
    });

});

createUsers(7);

console.log('Fakeserver listening on port 3000');
