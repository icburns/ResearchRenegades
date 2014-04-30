<?php





?>

<!DOCTYPE html>
<html>
	<head>
		<title>Backchannel</title>
		<meta charset="UTF-8">
		<script src="http://ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.min.js"></script>
		<link href="backchannel.css" type="text/css" rel="stylesheet">
	</head>

	<body>
		<header>
			Topic 1.3 Information Systems
		</header>

		<section id='filters'>
			<div>Topics</div>
			<div>Answered Q's</div>
			<div>Unanswered Q's</div>
			<div>Resources</div>
			<div>My Questions</div>
		</section>

		<section id='posts'>
			<div id='backchannel'>
				<form id="filter">
					<fieldset>
						<input type="checkbox" name="Questions" value="Questions">Questions
						<input type="checkbox" name="Resources" value="Resources">Resources
						<input type="checkbox" name="General" value="General">General
					</fieldset>
				</form>
				<div class='question'>What is the E in TEDS?<button type="button" class="reply">Reply</button></div>
				<div class='resource'>To anyone who wants to learn more about jquery: http://www.w3schools.com/Jquery/default.asp</div>
				<div class='post'>check this out http://doge2048.com/</div>
			</div>
			<div id='newPost'>
				<form name='makeNewPost'>
					<div id='tags'>
						<button id='questionTag' name='question'>Question</button>
						<button id='resourceTag' name='Resource'>Resource</button>
					</div>
					<input class='postArea' type='text' name='newPost'>
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
					<li>Harry</li>
					<li>Doug</li>
					<li>Christian</li>
					<li>Michael</li>
					<li>Devin</li>
					<li>Ben</li>
					<li>Dinesvara</li>
					<li>Juan Martin</li>
					<li>Christina</li>
					<li>Brittney</li>
					<li>Sean</li>
					<li>Angela</li>
					<li>Linda</li>
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