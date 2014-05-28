"use strict";
(function()
{
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
			if(e.which == 13) {
				$("#filter").css('position','absolute');
				var name = $("#username").val();
				if (name != "") {
					$("#backchannel").html('');
					socket.emit("join", name);
					$("#login").fadeOut(250,function(){
						$("#login").detach();
					});
					$("#content").show();
					$("#postArea").focus();
				}
			}
		});

		// will repopulate users on a (dis)connection
		socket.on("update-users", function(currentUsers){
			$("#onlineUsers").empty();
			$.each(currentUsers, function(clientid, name) {
				var userElement = $("<li>", {id: "user_"+name, text:name});
				$('#onlineUsers').append(userElement);
			});
		});
	}
})();