var express = require('express'),
	app = express(),
	server = require('http').createServer(app),
	port = process.env.port || 8080;
	io = require('socket.io').listen(server);
	users = {},
	posts = {},
	postCount = 1; 

server.listen(port);

app.use(express.static(__dirname + ''));

io.sockets.on('connection', function(socket){
    socket.on("join", function(name){
        users[socket.id] = name;
		console.log(users);
        io.sockets.emit("update", name + " has joined the server.")
        io.sockets.emit("update-users", users);
    });

	socket.on("send", function(msg){
		postCount++;
		var newPost = {};
		if(msg.tag != "resource" && msg.tag != "question"){
			msg.tag = "";
		}
		newPost.id = postCount;
		newPost.tag = msg.tag;
		newPost.timestamp = msg.timestamp;
		newPost.name = users[socket.id];
		newPost.text = msg.post;
		posts[postCount] = newPost;
        io.sockets.emit("post", newPost);
    });

    socket.on("disconnect", function(){
        io.sockets.emit("update", users[socket.id] + " has left the server.");
        delete users[socket.id];
        io.sockets.emit("update-users", users);
    });
});