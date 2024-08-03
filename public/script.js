const socket = io();

function connectUser(username){
	console.log("CONNECTING USER...");
	socket.emit('connectUser', {"username":username,"usercolor":getRandomHSLColor()});
	localStorage.setItem('username', username);
    //document.getElementById('lobby').style.display = 'none';
    //document.getElementById('connected').style.display = 'block';
}

function getRandomHSLColor() {
	const hue = Math.floor(Math.random() * 360);
	const saturation = 79;
	const lightness = 46;
	return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

if(localStorage.getItem('username') != null){
	connectUser(localStorage.getItem('username'));
}

document.getElementById('connectButton').addEventListener('click', () => {
	
	if(localStorage.getItem('username') == null){
		const username = $('#usernameInput').val();

		if (username != '' && username.length >= 3) {
			connectUser(username);
		} else {
			console.log("INVALID USERNAME");
		}
	} else {
		console.log("ALREADY CONNECTED...");
	}
});

document.getElementById('sendMessageButton').addEventListener('click', () => {
	const message = $('#textMessage').val();
	$('#textMessage').val('');
	if(message.length > 0 && localStorage.getItem('username')!=null){
		const now = new Date();
		const hours = String(now.getHours()).padStart(2, '0');
		const minutes = String(now.getMinutes()).padStart(2, '0');
		const seconds = String(now.getSeconds()).padStart(2, '0');
		const time = `${hours}:${minutes}:${seconds}`;
		const username = localStorage.getItem('username');
		socket.emit('sendMessage', [username,time,message]);
	}
});

socket.on('updateUserList', (users) => {
	const userList = document.getElementById('userList');
	userList.innerHTML = '';

	console.log("updating..");

	if(Object.keys(users).length == 0){
		userList.innerHTML += '<em>No hay usuarios conectados...</em>';
	} else {
		console.log(users);
		for (const user in users) {
			const listItem = document.createElement('li');
			listItem.innerHTML = '<strong><span style="color:'+users[user]+';">'+user+'</span></strong>';
			userList.appendChild(listItem);
			if(user == localStorage.getItem('username')){
				listItem.innerHTML += '<button id="disconnectButton">Disconnect</button>';
				document.getElementById('disconnectButton').addEventListener('click', () => {
					socket.emit('disconnectUser', localStorage.getItem('username'));
					localStorage.removeItem('username');
					//document.getElementById('lobby').style.display = 'block';
					//document.getElementById('connected').style.display = 'none';
				});
			}
		};
	}
});

socket.on('updateChatList', (messages) => {
	const $chatList = $('#chatList');
	$chatList.html('');

	if(messages.length == 0){
		$chatList.html('<em>Aún no hay mensajes...</em>');
	} else {
		messages.forEach(message => {
			const $listItem = $('<li></li>');
			if(message[0] == localStorage.getItem('username')){
			$listItem.html('<div class="message-div"><strong>'+message[1]+' <span style="color:'+message[3]+';">'+message[0]+'</span>: </strong>'+message[2]+'</div>');
			} else {
				$listItem.html('<div class="message-div"><strong>'+message[1]+' <span style="color:'+message[3]+';">'+message[0]+'</span>: </strong>'+message[2]+'</div>');
			}
			$listItem.css({
				'display':'flex',
				'justify-content':'left'
			});
			
			$chatList.append($listItem);
		});
	}
});