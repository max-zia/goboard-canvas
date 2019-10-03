var canvas = document.getElementById('go');
var c = canvas.getContext('2d');

// Settings 
var canvasColour = 'beige', // whole canvas colour
boardColour = 'orange', // board colour
stoneBorderColour = 'black', // stone border colour
lineThickness = 1.75, // width of board lines
radius = 0.5, // intersection size
spacing = 25, // space between intersections
stone = ((spacing / 2) - 1), // stone size
boardSize = 19, // board size (9x9, 13x13, or 19x19)
x = 30, // initial x coordinate
y = 30, // initial y coordinate
permissDiff = (spacing / 2), // permissable difference for mouse clicks 
starPoints = {  // star point info (coordinates and size)
	9: [getCo(3, 3), getCo(7, 3), getCo(3, 7), getCo(5, 5), getCo(7, 7)],
	13: [getCo(4, 4), getCo(10, 4), getCo(7, 7), getCo(10, 10), getCo(4, 10)],
	19: [
			getCo(4, 4), getCo(16, 4), getCo(10, 4),
			getCo(4, 10), getCo(10, 10), getCo(16, 10),
			getCo(4, 16), getCo(16, 16), getCo(10, 16),
		],
	starSize: (spacing / 6),
}

function getCo(xCo, yCo) {
	return [(x + (spacing * (xCo - 1))), (y + (spacing * (yCo - 1)))]
}

function fillCanvas() {
	c.fillStyle = canvasColour;
	c.fillRect(0, 0, canvas.width, canvas.height);
	c.fillStyle = boardColour;
	c.fillRect(x, y, (spacing * (boardSize - 1)), (spacing * (boardSize - 1)));
}

// constructor function for each point on board
function Intersection(xCo, yCo, radius) {
	this.xCo = xCo;
	this.yCo = yCo;
	this.radius = radius;
	this.colour = 'navy';
	this.draw = function() {
		c.beginPath();
		c.arc(this.xCo, this.yCo, this.radius, 0, (Math.PI * 2));
		c.strokeStyle = stoneBorderColour 
		c.fillStyle = this.colour;
		c.fill();
		c.stroke();
	}
}

function intersectionArray(xCo, yCo) {
	superArray = []
	for (var j = 0; j < boardSize; j++) {
		rowArray = []
		for (var i = 0; i < boardSize; i++) {
			// create an intersection
			var intersection = new Intersection(xCo, yCo, radius);
			// check whether intersection is star point
			// if so, increase radius
			var starArray = starPoints[boardSize];
			for (var k = 0; k < starArray.length; k++) {
				if (starArray[k][0] == intersection.xCo &&
					starArray[k][1] == intersection.yCo) {
					intersection.radius = starPoints.starSize; 
				}
			}
			// add intersection to rowArray
			rowArray.push(intersection);
			xCo += spacing;
		}
		superArray.push(rowArray);
		xCo = x;
		yCo += spacing;
	}
	return superArray;
}

function drawIntersections(array) {
	for (var i = 0; i < array.length; i++) {
		for (var j = 0; j < array.length; j++) {
			array[i][j].draw();
		}
	}
}

function drawGrid(xCo, yCo) {
	for (var i = 0; i < boardSize; i++) {
		// draw line to connect all intersections on row
		c.beginPath();
		c.moveTo(xCo, yCo);
		c.lineWidth = lineThickness;
		c.lineTo(xCo + (spacing * (boardSize - 1)), yCo);
		c.stroke();
		// initialise variables for next row
		xCo = x;
		yCo += spacing;
	}
	// draw lines for columns
	for (var i = 0; i < boardSize; i++) {
		c.beginPath();
		c.moveTo(x, y);
		c.lineWidth = lineThickness;
		c.lineTo(x, y + (spacing * (boardSize - 1)));
		c.stroke();
		x += spacing;
	}
}

// gather all coordinates and push to clickLog using
// click event listener. clickLog is currently used to 
// determine which colour should play.
clickLog = {
	x: [],
	y: [],
}

canvas.addEventListener('click', function(event) {
	clickLog.x.push(event.x);
	clickLog.y.push(event.y);
});

function libertyCheck(point, points) {
	var xPosition = point.xCo;
	var yPosition = point.yCo;
	filledLiberties = [];

	// add points above, below, left, and right to filledLiberties
	for (var row of points) {
		for (var item of row) {
			if (item.xCo == xPosition - spacing &&
				item.yCo == yPosition) {
				filledLiberties.push(item);
			} else if (item.xCo == xPosition + spacing &&
				item.yCo == yPosition) {
				filledLiberties.push(item);
			} else if (item.xCo == xPosition &&
				item.yCo == yPosition + spacing) {
				filledLiberties.push(item);
			} else if (item.xCo == xPosition &&
				item.yCo == yPosition - spacing) {
				filledLiberties.push(item);
			}
		}
	}

	// compare colours of points in filledLiberties to point.colour
	var count = 0;
	for (var i = 0; i < filledLiberties.length; i++) {
		if ((filledLiberties[i].colour != point.colour) && 
			(filledLiberties[i].colour != 'navy')) {
			count++;
		}
	}

	// if all liberties filled in with opposite colour, stone captured
	if (count == filledLiberties.length) {
		point.radius = radius;
		point.colour = 'navy';
	}  
}

// listen for specific click events, and respond by
// increasing radius size of each intersection
function enableClick(points) {
	canvas.onclick = function(event) {
		for (var row of points) {
			for (var point of row) {
				if (Math.abs(event.x - point.xCo) < permissDiff &&
					Math.abs(event.y - point.yCo) < permissDiff) {
					if (point.radius != stone) {
						point.radius = stone;
						if (clickLog.x.length % 2) {
							point.colour = 'black';
						} else point.colour = 'white';
					}
				}
				point.draw();
				// liberty check can go here to ensure 
				// that all points are checked
				libertyCheck(point, points)
			}
		}
	}
}

function resetGame() {
	c.clearRect(0, 0, canvas.width, canvas.height);
	x = 30;
	y = 30;
}

function loadGame() {
	fillCanvas();
	drawGrid(30, 30);
	drawIntersections(boardArray);
}

var boardArray = intersectionArray(30, 30);
loadGame();
enableClick(boardArray);