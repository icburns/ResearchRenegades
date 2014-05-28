var express = require('express'),
	app = express(),
	server = require('http').createServer(app),
	port = process.env.port || 8080;
	io = require('socket.io').listen(server);
	users = {},
	posts = {},
	postCount = 0;

server.listen(port);

app.use(express.static(__dirname + ''));

io.sockets.on('connection', function(socket){
    socket.on("join", function(name){
		//require name
		if(name.length>0){
			var username = ""+name.trim();
			users[socket.id] = username;
			
			if(!username || username.length>24){
				username = username.substr(0,24);
			}
			io.sockets.emit("update-users", users);
			for(var ii=1; ii<=postCount; ii++){
				socket.emit("post", posts[ii]);
			}
		}
    });

	socket.on("send", function(msg){
		//check for ghost users
		if(users[socket.id]){
			postCount++;
			var newPost = {};
			//truncate post to character limit
			if(!msg.post || msg.post.length>250){
				msg.post = msg.post.substr(0,250);
			}
			//apply tag
			if(msg.tag != "resource" && msg.tag != "question"){
				msg.tag = "";
			}
			
			var msgToPost = processText(msg.post.trim());
			
			newPost.id = postCount;
			newPost.tag = msg.tag;
			newPost.timestamp = msg.timestamp;
			newPost.name = users[socket.id];
			newPost.text = msgToPost;
			posts[postCount] = newPost;
			io.sockets.emit("post", newPost);
		}
    });

	socket.on("reply", function(msg){
		var postIndex = parseInt(1+msg.parent);		
		var currentPost = posts[postIndex];
		if(!currentPost.replies){
			currentPost.replies = [];
		}
		if(!msg.post || msg.post.length>250){
			msg.post = msg.post.substr(0,250);
		}
		var newReply = {};
		newReply.timestamp = msg.timestamp;
		newReply.tag = '';
		newReply.name = users[socket.id];
		newReply.text = msg.post.trim();
		newReply.parentIndex = msg.parent;
		currentPost.replies[currentPost.replies.length] = newReply;
		posts[postIndex] = currentPost;
        io.sockets.emit("reply", newReply);
		
    });	
	
	
    socket.on("disconnect", function(){
        io.sockets.emit("update", users[socket.id] + " has left the server.");
        delete users[socket.id];
        io.sockets.emit("update-users", users);
    });
	
	function processText(messageText){
		console.log(messageText);
		messageText = messageText.replace(/\'/g,"&#39;");
		messageText = messageText.replace(/\"/g,"&#34;");
		messageText = messageText.replace(/</g,"&#60;");
		messageText = messageText.replace(/>/g,"&#62;");
		var	processedText = messageText.replace(/((((https?:\/\/)?(www\.))|((https?:\/\/)(www\.)?))[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*))/, '<a class="messageLink" target="_blank" href="$1">$1</a>');
		console.log(processedText);
		return processedText;
	}
});