<?php





?>

<!DOCTYPE html>
<html>
	<head>
		<title>Backchannel</title>
		<meta charset="UTF-8">
		<link href="backchannel.css" type="text/css" rel="stylesheet">
	</head>

	<body>
		<header>
			
		</header>

		<section id='filters'>
			<div>Topics</div>
			<div>Answered Q's</div>
			<div>Unanswered Q's</div>
			<div>My Questions</div>
		</section>

		<section id='posts'>
			<div id='backchannel'>
				<div class='question'>What is the E in TEDS?</div>
				<div class='resource'>To anyone who wants to learn more about jquery: http://www.w3schools.com/Jquery/default.asp</div>
				<div class='post'>check this out http://doge2048.com/</div>
			</div>
			<div id='newPost'>
				<form>
					<div id='tags'>
						<button id='questionTag' name='question'>Question</button>
						<button id='resourceTag' name='Resource'>Resource</button>
					</div>
					<input class='postArea' type='textfield' name='newPost'>
					<input class='submitPost' type='submit'>
				</form>
			</div>
		</section>

		<section id='usersChat'>
			<div id='users'>
				<ul id='onlineTA'>
					<li>Paul</li>
					<li>Tania</li>
				</ul>
				<ul id='onlineUsers'>
					<li>Graham</li>
					<li>Ian</li>
					<li>Vivek</li>
					<li>Leighton</li>
					<li>Leon</li>
					<li>Romelu</li>
				</ul>
			</div>						
			<div id='chat'>
				<div class='activeChat'></div>
			</div>			
		</section>

		<footer>
		</footer>
		<script src="backchannel.js"> </script>	
	</body>
</html>