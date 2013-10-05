$(document).ready(function() {
	var canvas = $('#myCanvas');
	var context = canvas.get(0).getContext('2d');
	var canvasWidth = canvas.width(), canvasHeight = canvas.height();

	$(window).resize(resizeCanvas);

	function resizeCanvas() {
		canvas.attr('width', window.innerWidth);
		canvas.attr('height', window.innerHeight);
		canvasWidth = canvas.width();
		canvasHeight = canvas.height();
	}

	resizeCanvas();

	var playAnimation = true,
		startButton = $('#startAnimation'),
		stopButton = $('#stopAnimation');

	startButton.hide();
	startButton.click(function() {
		$(this).hide();
		stopButton.show();

		playAnimation = true;
		animate();
	});
	stopButton.click(function() {
		$(this).hide();
		startButton.show();

		playAnimation = false;
		
	});

	var Asteroid = function(x, y, radius, mass, vx, vy, ax, ay) {
		this.x = x;
		this.y = y;
		this.radius = radius;
		this.mass = mass;

		this.vx = vx;
		this.vy = vy;

		this.ax = ax;
		this.ay = ay;
	};

	var asteroids = new Array();
	for (var i = 0; i < 10; i++) {
		var x = 20 + (Math.random() * (canvasWidth - 40));
		var y = 20 + (Math.random() * (canvasHeight - 40));
		var radius = 5 + Math.random() * 10, mass = radius / 2;
		var vx = Math.random() * 4 - 2;
		var vy = Math.random() * 4 - 2;
		var ax = Math.random() * 0.2 - 0.1, ay = Math.random() * 0.2 - 0.1;

		asteroids.push(new Asteroid(x, y, radius, mass, vx, vy, ax, ay));	
	}


	function animate() {
		context.clearRect(0, 0, canvasWidth, canvasHeight);
		context.fillStyle = 'rgb(255, 255, 255)';

		var asteroidsLength = asteroids.length;
		for (var i = 0; i < asteroidsLength; i++) {
			var tmpAsteroid = asteroids[i];
			
			if (Math.abs(tmpAsteroid.vx) < 10) {
				tmpAsteroid.vx += tmpAsteroid.ax;
			}
			if (Math.abs(tmpAsteroid.vy) < 10) {
				tmpAsteroid.vy += tmpAsteroid.ay;
			}
			
			tmpAsteroid.x += tmpAsteroid.vx;
			tmpAsteroid.y += tmpAsteroid.vy;

			for (var j = i + 1; j < asteroidsLength; j++) {
				var tmpAsteroidB = asteroids[j];
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
			}

			

			if (tmpAsteroid.x - tmpAsteroid.radius < 0) {
				tmpAsteroid.x = tmpAsteroid.radius;
				tmpAsteroid.vx *= -1;
				tmpAsteroid.ax *= -1;
			} else if (tmpAsteroid.x + tmpAsteroid.radius > canvasWidth) {
				tmpAsteroid.x = canvasWidth - tmpAsteroid.radius;
				tmpAsteroid.vx *= -1;
				tmpAsteroid.ax *= -1;
			}

			if (tmpAsteroid.y - tmpAsteroid.radius < 0) {
				tmpAsteroid.y = tmpAsteroid.radius;
				tmpAsteroid.vy *= -1;
				tmpAsteroid.ay *= -1;
			} else if (tmpAsteroid.y + tmpAsteroid.radius > canvasHeight) {
				tmpAsteroid.y = canvasHeight - tmpAsteroid.radius;
				tmpAsteroid.vy *= -1;
				tmpAsteroid.ay *= -1;
			}

			context.beginPath();
			context.arc(tmpAsteroid.x, tmpAsteroid.y, tmpAsteroid.radius, 0, Math.PI*2, false);
			context.closePath();
			context.fill();
		}

		if (playAnimation) {
			setTimeout(animate, 33);
		}
	}
	animate();
});