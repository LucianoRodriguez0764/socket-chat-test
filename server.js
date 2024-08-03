const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let connectedUsers = {};
let messagesUsers = [];

app.use(express.static('public'));
app.use(express.static('js'));

io.on('connection', (socket) => {

	socket.on('connectUser', (userdata) => {

		if (!connectedUsers.hasOwnProperty(userdata["username"])) {
			connectedUsers[userdata["username"]] = userdata["usercolor"];
		}
		io.emit('updateUserList', connectedUsers);
	});
	
	socket.on('disconnectUser', (username) => {
		delete connectedUsers[username];
		io.emit('updateUserList', connectedUsers);
	});

	socket.on('sendMessage', (message) => {
		message.push(connectedUsers[message[0]])
		messagesUsers.push(message);
		io.emit('updateChatList', messagesUsers);
	});
	
	io.emit('updateChatList', messagesUsers);
	io.emit('updateUserList', connectedUsers);

	console.log(connectedUsers);
});



server.listen(process.env.PORT || 3000, () => {
	console.log('Servidor escuchando en puerto '+(process.env.PORT || 3000));
});