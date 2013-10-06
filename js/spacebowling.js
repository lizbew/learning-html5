$(document).ready(function() {
	var canvas = $('#gameCanvas');
	var context = canvas.get(0).getContext('2d');
	var canvasWidth = canvas.width(), canvasHeight = canvas.height();


	var playGame = false;

	var platformX, platformY, platformOuterRadius, platformInnerRadius;

	var asteroids;

	var player, playerOriginalX, playerOriginalY;

	var playerSelected, playMaxAbsVelocity, playerVelocityDampener, powerX, powerY;

	var score;

	var Asteroid = function(x, y, radius, mass, friction) {
		this.x = x;
		this.y = y;
		this.radius = radius;
		this.mass = mass;
		this.friction = friction;
		this.vx = 0;
		this.vy = 0;
		this.player = false;
	}

	var ui = $('#gameUI');
	var uiIntro = $('#gameIntro');
	var uiStats = $('#gameStats');
	var uiComplete = $('#gameComplete');
	var uiPlay = $('#gamePlay');
	var uiReset = $('.gameReset');
	var uiRemaining = $('#gameRemaining');
	var uiScore = $('.gameScore');
	
	function init() {
		uiStats.hide();
		uiComplete.hide();

		uiPlay.click(function(e) {
			e.preventDefault();
			uiIntro.hide();
			console.log('start');
			startGame();
		});

		uiReset.click(function(e) {
			e.preventDefault();
			uiComplete.hide();
			startGame();
		});
	}

	function resetPlayer() {
		player.x = playerOriginalX;
		player.y = playerOriginalY;

		player.vx = 0;
		player.vy = 0;
	}

	function startGame() {
		uiScore.html('0');
		uiStats.show();

		playGame = true;
		platformX = canvasWidth / 2;
		platformY = 150;
		platformOuterRadius = 100;
		platformInnerRadius = 75;

		asteroids = new Array();
		playerSelected = false;
		playerMaxAbsVelocity = 30;
		playerVelocityDampener = 0.3;
		powerX = -1;
		powerY = -1;

		score = 0;

		var pRadius = 15, pMass = 10, pFriction = 0.97;
		playerOriginalX = canvasWidth / 2;
		playerOriginalY = canvasHeight - 150;
		player = new Asteroid(playerOriginalX, playerOriginalY, pRadius, pMass, pFriction);
		player.player = true;
		asteroids.push(player);

		var outerRing = 8, ringCount = 3;
		var ringSpacing = (platformOuterRadius/ (ringCount - 1));

		for (var r = 0; r < ringCount; r++) {
			var currentRing = 0;
			var angle = 0, ringRadius = 0;

			if ( r == ringCount - 1) {
				currentRing = 1;
			} else {
				currentRing = outerRing - (r * 3);
				angle = 360/currentRing;
				ringRadius = platformInnerRadius - (ringSpacing * r);
			}

			for (var a = 0; a < currentRing; a++) {
				var x = 0, y = 0;

				if (r == ringCount -1) {
					x = platformX;
					y = platformY;
				} else {
					x = platformX + (ringRadius * Math.cos((angle * a) * (Math.PI / 180)));
					y = platformY + (ringRadius * Math.sin((angle * a) * (Math.PI / 180)));
				}

				var radius = 10, mass = 5, friction = 0.95;
				asteroids.push(new Asteroid(x, y, radius, mass, friction));
			}
		}
		uiRemaining.html(asteroids.length - 1);

		$(window).mousedown(function(e) {
			if (!playerSelected && player.x == playerOriginalX && player.y == playerOriginalY) {
				var canvasOffset = canvas.offset();
				var canvasX = Math.floor(e.pageX - canvasOffset.left);
				var canvasY = Math.floor(e.pageY - canvasOffset.top);

				if (!playGame) {
					playGame = true;
					animate();
				}

				var dX = player.x - canvasX;
				var dY = player.y - canvasY;
				var distance = Math.sqrt((dX * dX) + (dY * dY));
				var padding = 5;
				if (distance < player.radius + padding) {
					powerX = player.x;
					powerY = player.y;
					playerSelected = true;
				}
			}
		});
		$(window).mousemove(function(e) {
			if (playerSelected) {
				var canvasOffset = canvas.offset();
				var canvasX = Math.floor(e.pageX - canvasOffset.left);
				var canvasY = Math.floor(e.pageY - canvasOffset.top);

				var dX = player.x - canvasX;
				var dY = player.y - canvasY;
				var distance = Math.sqrt((dX * dX) + (dY * dY));


				if (distance * playerVelocityDampener < playerMaxAbsVelocity) {
					powerX = canvasX;
					powerY = canvasY;
				} else {
					var ratio = playerMaxAbsVelocity / (distance * playerVelocityDampener);
					powerX = playerX + ratio * dX;
					powerY = playerX + ratio * dY;
				}
			}
		});
		$(window).mouseup(function(e) {
			if (playerSelected) {
				var dX = powerX - player.x;
				var dY = powerY - player.y;

				player.vx = - (dX * playerVelocityDampener);
				player.vy = - (dY * playerVelocityDampener);

				uiScore.html(++score);
			}

			playerSelected = false;
			powerX = -1;
			powerY = -1;
		});
		animate();
	}

	function animate() {
		context.clearRect(0, 0, canvasWidth, canvasHeight);

		context.fillStyle = 'rgb(100, 100, 100)';
		context.beginPath();
		context.arc(platformX, platformY, platformOuterRadius, 0, Math.PI * 2, false);
		context.closePath();
		context.fill();


		if (playerSelected) {
			context.strokeStyle = 'rgb(255, 255, 255)';
			context.lineWidth = 3;
			context.beginPath();
			context.moveTo(player.x, player.y);
			context.lineTo(powerX, powerY);
			context.closePath();
			context.stroke();
		}
		context.fillStyle = 'rgb(255, 255, 255)';
		var deadAsteroids = new Array();
		var asteroidsLength = asteroids.length;
		for (var i = 0; i < asteroidsLength; i++) {
			var tmpAsteroid = asteroids[i];

			for (var j = i + 1; j < asteroidsLength; j++) {
				var tmpAsteroidB = asteroids[j];

				//---------------------
				var dX = tmpAsteroidB.x - tmpAsteroid.x;
				var dY = tmpAsteroidB.y - tmpAsteroid.y;
				var distance = Math.sqrt((dX * dX) + (dY * dY));

				if (distance < tmpAsteroid.radius + tmpAsteroidB.radius) {
					var angle = Math.atan2(dY, dX);
					var sine = Math.sin(angle);
					var cosine = Math.cos(angle);


					var x = 0, y = 0;
					var xB = dX * cosine + dY * sine;
					var yB = dY * cosine - dX * sine;

					var vX = tmpAsteroid.vx * cosine + tmpAsteroid.vy * sine;
					var vY = tmpAsteroid.vy * cosine - tmpAsteroid.vx * sine;
					
					var vXB = tmpAsteroidB.vx * cosine + tmpAsteroidB.vy * sine;
					var vYB = tmpAsteroidB.vy * cosine - tmpAsteroidB.vx * sine;

					var vTotal = vX - vXB;

					//vX *= -1;
					//vXB *= -1;
					vX = ((tmpAsteroid.mass - tmpAsteroidB.mass) * vX + 2 * tmpAsteroidB.mass * vXB)/(tmpAsteroid.mass + tmpAsteroidB.mass);
					vXB = vTotal + vX;

					xB = x + (tmpAsteroid.radius + tmpAsteroidB.radius);

					tmpAsteroid.x = tmpAsteroid.x + (x * cosine - y * sine);
					tmpAsteroid.y = tmpAsteroid.y + (y * cosine + x * sine);

					tmpAsteroidB.x = tmpAsteroidB.x + (xB * cosine - yB * sine);
					tmpAsteroidB.y = tmpAsteroidB.y + (yB * cosine + xB * sine);

					tmpAsteroid.vx = vX * cosine - vY * sine;
					tmpAsteroid.vy = vY * cosine + vX * sine;

					tmpAsteroidB.vx = vXB * cosine - vYB * sine;
					tmpAsteroidB.vy = vYB * cosine + vXB * sine;
				}
				//---------------------
			}

			tmpAsteroid.x += tmpAsteroid.vx;
			tmpAsteroid.y += tmpAsteroid.vy;

			if (!tmpAsteroid.player) {
				var dXp = tmpAsteroid.x - platformX;
				var dYp = tmpAsteroid.y - platformY;
				var distance = Math.sqrt((dXp * dXp) + (dYp * dYp));

				if (distance > platformOuterRadius) {
					if (tmpAsteroid.radius > 0) {
						tmpAsteroid.radius -= 2;
					} else {
						deadAsteroids.push(tmpAsteroid);
					}
				}
			}

			//friction
			if (Math.abs(tmpAsteroid.vx) > 0.1) {
				tmpAsteroid.vx *= tmpAsteroid.friction;
			} else {
				tmpAsteroid.vx = 0;
			}

			if (Math.abs(tmpAsteroid.vy) > 0.1) {
				tmpAsteroid.vy *= tmpAsteroid.friction;
			} else {
				tmpAsteroid.vy = 0;
			}

			if (player.x != playerOriginalX && player.y != playerOriginalY) {
				if (player.vx == 0 && player.vy == 0) {
					resetPlayer();
				} else if (player.x + player.radius < 0) {
					resetPlayer();
				} else if (player.x - player.radius > canvasWidth) {
					resetPlayer();
				} else if (player.y + player.radius < 0) {
					resetPlayer();
				} else if (player.y - player.radius > canvasHeight) {
					resetPlayer();
				}
			}
			context.beginPath();
			context.arc(tmpAsteroid.x, tmpAsteroid.y, tmpAsteroid.radius, 0, Math.PI * 2, false);
			context.closePath();
			context.fill();
		}

		var deadAsteroidsLength = deadAsteroids.length;
		if (deadAsteroidsLength > 0) {
			for (var di = 0; di < deadAsteroidsLength; di++) {
				var tmpDeadAsteroid = deadAsteroids[di];
				asteroids.splice(asteroids.indexOf(tmpDeadAsteroid), 1);

				var remaining = asteroids.length -1;
				uiRemaining.html(remaining);

				if (remaining == 0) {
					playGame = false;
					uiStats.hide();
					uiComplete.show();
					$(window).unbind('mousedown');
					$(window).unbind('mousemove');
					$(window).unbind('mouseup');
				}
			}
		}
		if (playGame) {
			setTimeout(animate, 33);
		}
	}

	init();
});