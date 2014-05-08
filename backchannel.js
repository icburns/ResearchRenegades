"use strict";
(function()
{
	$(document).ready(function(){
		ServerSpace();
		UISpace();
	});


	var UISpace = function(){
		$('#questionTag').click(function() {
			tagPost('question','rgba(100,100,200,1)');
		});
			$('#resourceTag').click(function() {
			tagPost('resource','rgba(100,200,100,1)');
		});

		function tagPost(tagValue,tagColor){
			$("#resourceTag").css('background-color','transparent');
			$("#questionTag").css('background-color','transparent');
			if($('#postTag').val()==tagValue){
				tagColor = 'transparent';
				tagValue = '';
			}
			$("#"+tagValue+"Tag").css('background-color',tagColor);
			$('#postTag').val(tagValue);
		}
	}

	var ServerSpace = function(){
		var socket = io.connect();
		var postForm = $('form[name=makeNewPost]');
		var backchannel = $('#backchannel');
		var postArea = $('#postArea');

		postForm.submit(function(e){
			e.preventDefault();
			socket.emit('send', {"post":postArea.val(), "name":socket.socket.sessionid, "tag":$('#postTag').val()});
			postArea.val('');
			$("#resourceTag").css('background-color','transparent');
			$("#questionTag").css('background-color','transparent');
			$("#postTag").val('');
		});

		socket.on('post', function(msg){
			$('#postTag').val('');
			var newMessage = $('<div>', {
				text: msg.who+": \'"+msg.post+"\' ("+msg.tag+")"
			}).appendTo(backchannel);
		});

		$("#username").keyup(function(e){
			if(e.which == 13) {
				var name = $("#username").val();
				if (name != "") {
					socket.emit("join", name);
					$("#login").detach();
				}
			}
		});

		//will probably ditch this functionality as it would be cumbersome for b$
		socket.on("update", function(msg) {
			var newMessage = $('<div>', {                  
			$text: msg
			}).appendTo("#backchannel");
		});

		// will repopulate users on a (dis)connection
		socket.on("update-users", function(currentUsers){
			$("#onlineUsers").empty();
			$.each(currentUsers, function(clientid, name) {
				var userElement = $("<li>", {id: "user_"+name});
				userElement.html(name);
				$('#onlineUsers').append(userElement);
			});
		});


		socket.on("disconnect", function(){
			$("#msgs").append("The server is not available");
			$("#msg").attr("disabled", "disabled");
			$("#send").attr("disabled", "disabled");
		});
	}
})();
