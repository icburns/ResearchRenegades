"use strict";
(function()
{
	var screenname = "";
	$(document).ready(function(){
		ServerSpace();
		UISpace();
	});

	//anything that does not involve server communication
	var UISpace = function(){
		//initiate page with welcome/login tripwire
		$("#content").hide();
		
		//enable post tagging
		$('#questionTag').click(function() {
			$('#postArea').focus();
			tagPost('question','rgba(100,100,200,1)');
		});
		$('#resourceTag').click(function() {
			$('#postArea').focus();
			tagPost('resource','rgba(100,200,100,1)');
		});
		
		function tagPost(tagValue,tagColor){
			$("#resourceTag").css('background-color','rgba(200,200,200,.75);');
			$("#questionTag").css('background-color','rgba(200,200,200,.75);');
			if($('#postTag').val()==tagValue){
				tagColor = 'rgba(200,200,200,.75);';
				tagValue = '';
			}
			$("#"+tagValue+"Tag").css('background-color',tagColor);
			$('#postTag').val(tagValue);
		}
		
		//set default backchannel filters to show all and enable filtering
		$('input[name=Questions]').prop("checked",true);
		$('input[name=Resources]').prop("checked",true);		
		$('input[name=General]').prop("checked",true);
	
		$('input[name=Questions]').on("change",applyFilters);
		$('input[name=Resources]').on("change",applyFilters);		
		$('input[name=General]').on("change",applyFilters);
		
		//toggle post visibility based on filter state
		function applyFilters(){
			$('.question').hide();
			$('.resource').hide();
			$('.backchannelPost').hide();
			if($('input[name=General]').prop("checked")){
				$('.backchannelPost').show();
				$('.question').hide();
				$('.resource').hide();	
			}
			if($('input[name=Questions]').prop("checked")){
				$('.question').show();
			}
			if($('input[name=Resources]').prop("checked")){
				$('.resource').show();
			}
		}
		
		//allow enter to submit posts in the main posts area
		$("#postArea").keyup(function(e){
			if(e.which == 13 && !e.shiftKey){
				e.preventDefault();
				$('form[name=makeNewPost]').submit();
			}
		});
		
		$("#ribbon").click(function(e){
			var notYet = $("<div>", {
				id:"unfinishedInfo",
				text:"This area has not yet been implemented, sorry. This filter set is geared toward inter-lecture experience, and would offer students the chance to check on, for example, resources from throughout the quarter. For the Capstone event, the demo is focused on the single-lecture experience." 
			});
			$("#ribbon").append(notYet);
			$("#unfinishedInfo").fadeIn(100).delay(20000).fadeOut(1000,function(e){$("#unfinishedInfo").detach();});
		});
		
	}

	//anything that involves communication with the server
	var ServerSpace = function(){
		var socket = io.connect();
		var postForm = $('form[name=makeNewPost]');
		var backchannel = $('#backchannel');
		var postArea = $('#postArea');
			
		//submits a post for the backchannel
		postForm.submit(function submitPost(e){
			e.preventDefault();
			var dateTime = new Date();
			socket.emit('send', {"post":postArea.val(), "tag":$('#postTag').val(), "timestamp":dateTime.toUTCString()});
			postArea.val('');
			$("#resourceTag").css('background-color','rgba(200,200,200,.75)');
			$("#questionTag").css('background-color','rgba(200,200,200,.75)');
			$("#postTag").val('');
		});

		//receives post from server and posts to backchannel
		socket.on('post', function(messageToPost){
			var newPostMarkup = makePostMarkup("backchannelPost", messageToPost);
			$("#backchannel").append(newPostMarkup);
			$('.question').hide();
			$('.resource').hide();
			$('.backchannelPost').hide();
			if($('input[name=General]').prop("checked")){
				$('.backchannelPost').show();
				$('.question').hide();
				$('.resource').hide();	
			}
			if($('input[name=Questions]').prop("checked")){
				$('.question').show();
			}
			if($('input[name=Resources]').prop("checked")){
				$('.resource').show();
			}
			$("#backchannel").animate({ scrollTop: $('#backchannel')[0].scrollHeight}, 0);
		});
		
		//receives post from server and posts to backchannel
		socket.on('reply', function(replyToPost){
			var parentPost = $(".backchannelPost")[replyToPost.parentIndex];
			var replyBox = $(parentPost).children(".replies").children("textarea");
			$(makePostMarkup("backchannelReply",replyToPost)).insertBefore($(replyBox));	
		});
		

		//post data from server applied to backchannel post template
		function makePostMarkup(postType, messageToPost){
			var wrapper = $('<div>', {
				class: postType+" "+messageToPost.tag
			});
			var t = Date.parse(messageToPost.timestamp);
			var d = new Date();
			d.setTime(t);
			var timestamp =$('<time>', {
				class: "post_time",
				text: d.toLocaleString()
			});
			var name = $('<span>', {
				class: "post_name",
				text: messageToPost.name
			});
			var post = $('<div>', {
				class: "post_message"
			});
			var splitText = messageToPost.text.split("\n");
			for(var ii=0; ii<splitText.length; ii++){
				var postText = $('<p>', {
					html: splitText[ii]
				});				
				post.append(postText);
			}
			var postInfo =$('<div>', {
				class: "post_info"
			});
			
			postInfo.append(name);
			postInfo.append(timestamp)
			wrapper.append(postInfo);
			wrapper.append(post);
			
			//special actions for tagged posts, configures replies
			if(messageToPost.tag === 'question' || messageToPost.tag === 'resource'){
				wrapper.click(function(){
					$(this).children(".replies").toggle();
				});
				var expandPostTab = $('<div>', {
					class: "post_actions",
					text: "|reply|",
				});
				wrapper.append(expandPostTab);
				var childPosts = $('<div>', {
					class: "replies"
				});
				if(messageToPost.replies){
					for(var ii=0; ii<messageToPost.replies.length; ii++){
						var newReply = makePostMarkup("backchannelReply",messageToPost.replies[ii]);
						childPosts.append(newReply);
					}
				}
				var replyBox = $('<textarea>', {
					class: "reply",
					click: function(clickEvent) {
						clickEvent.stopPropagation();
					},
					keyup: function(e){
						if(e.which == 13 && !e.shiftKey){
							e.preventDefault();
							var dateTime = new Date();
							// !!!parent workaround is suspect
							socket.emit('reply', {"post":$(this).val(), "timestamp":dateTime.toUTCString(),"parent":$('.backchannelPost').index($(this).parent().parent())});
							$(this).val('');
						}
					}
				});
				childPosts.append(replyBox);
				childPosts.hide();
				wrapper.append(childPosts);
			}
			return wrapper;
		}
		
		//login actions, removes welcome page and reveals backchannel
		$("#username").keyup(function(e){
			if ($("#username").val() != "") {
				if(e.which == 13) {
					$("#filter").css('position','absolute');
					screenname = $("#username").val();
					$("#backchannel").html('');
					socket.emit("join", screenname);
					$("#login").fadeOut(250,function(){
						$("#login").detach();
					});
					var welcomeMessage = $("<div>", {
						id:"welcomeMessage",
						text:"Welcome, "+screenname
					});
					$("#infoheader").append(welcomeMessage);
					$("#content").show();
					$("#postArea").focus();
				}
			}
		});

		// will repopulate users on a (dis)connection
		socket.on("update-users", function(currentUsers){
			$("#onlineUsers").empty();
			$.each(currentUsers, function(clientid, name) {
				var userElement = $("<li>", {
					id:"user_"+clientid,
					text:name,
					click:function(e){
						socket.emit("openChat",clientid);
					}
				});
				$('#onlineUsers').append(userElement);
			});
		});
		
		socket.on("startChat", function(chatid,name){
			if($("#chat_"+chatid)[0]){
				$("#chat_"+chatid+" .chatBody").show();
				$("#chat_"+chatid+" .chatInput").show();
				$("#chat_"+chatid).removeClass('inactiveChat')
				$("#chat_"+chatid).removeClass('activeChat')
				$("#chat_"+chatid).addClass('activeChat')
			}else{
				var chatElement = $("<div>", {
					id:"chat_"+chatid,
					class:"activeChat",				
				});
				var chatHead = $("<div>", {
					class:"chatHead",
					click:function(e){
						$("#chat_"+chatid+" .chatBody").toggle();
						$("#chat_"+chatid+" .chatInput").toggle();
						$("#chat_"+chatid).toggleClass('activeChat');
						$("#chat_"+chatid).toggleClass('inactiveChat');
					},
					text:name			
				});			
				var closeChat = $("<div>", {
					class:"closeChat",
					text:"X",
					click:function(e){
						$("#chat_"+chatid).detach();
					}
				}); 
				var chatBody = $("<div>", {
					class:"chatBody"
				});
				var chatInput = $("<textarea>", {
					class:"chatInput",
					keypress: function(e){
						if(e.which == 13 && !e.shiftKey){
							e.preventDefault();
							socket.emit("sendChat",$(this).val(),chatid);
							$(this).val('');
						}
					}
				});
				chatHead.append(closeChat);
				chatElement.append(chatHead);
				chatElement.append(chatBody);
				chatElement.append(chatInput);
				$('#chat').append(chatElement);		
			}
		});
		
		socket.on("chatPost", function(msg,chatid,name){
			postToChat('Post',msg,chatid,screenname);
		});
		
		socket.on("chatReply", function(msg,chatid,name){
			postToChat('Reply',msg,chatid,name);
		});
		
		function postToChat(chatType, msg, chatid, name){
			
			var chatMessage = $("<div>", {
				class:"chat"+chatType,
			});
			var chatName = $("<span>", {
				class:"chatName",
				text:name			
			});			
			var chatText = $("<span>", {
				class:"chatText",
				html:msg
			});
			if($('#chat_'+chatid+' .chatBody').first().children()[0].classList[0]!="chat"+chatType){
				chatMessage.append(chatName);
			}
				chatMessage.append(chatText);
			$('#chat_'+chatid+' .chatBody').first().append(chatMessage);
			$('#chat_'+chatid+' .chatBody').animate({ scrollTop: $('#chat_'+chatid+' .chatBody')[0].scrollHeight}, 0);
		}
	}
})();