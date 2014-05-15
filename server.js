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
		var username = ""+name.trim();
		users[socket.id] = username;
		
		if(!username || username.length>24){
			username = username.substr(0,24);
		}
        io.sockets.emit("update-users", users);
		for(var ii=1; ii<=postCount; ii++){
			socket.emit("post", posts[ii]);
		}
    });

	socket.on("send", function(msg){
		postCount++;
		var newPost = {};
		if(!msg.post || msg.post.length>250){
			msg.post = msg.post.substr(0,250);
		}
		if(msg.tag != "resource" && msg.tag != "question"){
			msg.tag = "";
		}
		newPost.id = postCount;
		newPost.tag = msg.tag;
		newPost.timestamp = msg.timestamp;
		newPost.name = users[socket.id];
		newPost.text = msg.post.trim();
		posts[postCount] = newPost;
        io.sockets.emit("post", newPost);
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
});