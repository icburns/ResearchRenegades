var express = require('express'),
	app = express(),
	server = require('http').createServer(app),
	port = process.env.port || 8080;
	io = require('socket.io').listen(server);
	users = {};

server.listen(port);

app.use(express.static(__dirname + ''));

io.sockets.on('connection', function(socket){
    socket.on("join", function(name){
        users[socket.sessionid] = name;
        socket.emit("update", "You have connected to the server.");
        io.sockets.emit("update", name + " has joined the server.")
        io.sockets.emit("update-users", users);
    });

    socket.on("send", function(msg){
		if(msg.tag != "resource" && msg.tag != "question"){
			msg.tag = "";
		}
        io.sockets.emit("post", {"who":users[socket.sessionid],"post":msg.post, "tag":msg.tag});
    });

    socket.on("disconnect", function(){
        io.sockets.emit("update", users[socket.sessionid] + " has left the server.");
        delete users[socket.sessionid];
        io.sockets.emit("update-users", users);
    });
});