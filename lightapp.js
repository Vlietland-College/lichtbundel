var clicks = 0;
var lastClick = [0, 0];
var debug = true;

document.addEventListener('DOMContentLoaded', startup, false);



function startup(e){
    document.getElementById('drawcanvas').addEventListener('click', canvasclicked, false);

    document.getElementById('clear').addEventListener('click', resetAll, false);


}
var figure_points = [];
var figure_lines = [];
var light_points = [];

function Point(x, y) {
    this.x = x;
    this.y = y;
}

function Line(start, end){
    this.start = start
    this.end = end

}

function getCursorPosition(e) {
    var x;
    var y;

    if (e.pageX != undefined && e.pageY != undefined) {
        x = e.pageX;
        y = e.pageY;
    } else {
        x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
        y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
    }

    return [x, y];
}

function canvasclicked(e){

    let linetype = document.querySelector('input[name="linetype"]:checked').value;

    let x = getCursorPosition(e)[0] - this.offsetLeft;
    let y = getCursorPosition(e)[1] - this.offsetTop;
    let context = this.getContext('2d');

    if(linetype === 'figure'){
        let new_point =new Point(x,y)
        figure_points.push(new_point)
        if(figure_points.length >= 2){


            let prev_point = figure_points.at(-2);
            let new_line = new Line(prev_point, new_point)
            figure_lines.push(new_line)
            drawLine(context, new_line, '#000000', 6);

            addLineToList(new_line);
        }

    }
    else if(linetype === 'light'){
        if(light_points.length === 2){
            light_points = []
            clearCanvas()
            redrawFigure(context)
        }

        light_points.push(new Point(x,y))

        if(light_points.length === 2){
            //second new point
            if(debug){console.log("light real", light_points[0][0], light_points[0][1], x, y)}
            let calculated_beam = getLineToEnd( new Line(light_points[0],light_points[1]), this)

            let first_intersection = findFirstIntersection(calculated_beam, figure_lines)
            if(first_intersection){
                let first_intersetion_point = intersect(calculated_beam, first_intersection)

                calculated_beam.end = first_intersetion_point
                drawMirroredBeam(calculated_beam, first_intersection, first_intersetion_point)
            }

            drawLine(context, calculated_beam, '#ff0000', 6)
        }

    }


}

function drawMirroredBeam(light, mirror, intersection_point){
    let angle = find_angle(light.start, intersection_point, mirror.start)
    let side = true
    if(angle === Math.PI*0.5){
        console.log("haaks joehoe")

    }
    else if(angle > Math.PI*0.5){
        side = false
        angle = Math.PI - angle

    }

    console.log(angle)


}



function getLineToEnd(line, canvas){
    //calculate when the line hits the border to make it a finite line for intersection calculation
    let x1 = line.start.x
    let y1 = line.start.y
    let x2 = line.end.x
    let y2 = line.end.y

    let slope = getSlopeForPoints(x1, y1, x2, y2);
    let dir = [x2>x1, y2>y1]

    let calculated_beam = new Line(line.start, new Point(null,null))
    //calculate if x or y boundary is hit
    let limits = [dir[0] ? canvas.width : 0, dir[1] ? canvas.height : 0];

    //intersection point with x-axis
    let intersect_with_x = (limits[1]-y2)/slope+x2

    if(0 < intersect_with_x &&  intersect_with_x < canvas.height){
        //intersecting with x boundry
        if(debug){console.log("intersecting x")}
        calculated_beam.end.x = intersect_with_x;
        calculated_beam.end.y = limits[1];

    }
    else{
        // intersecting with y boundry
        if(debug){console.log("intersecting y")}
        let intersect_with_y = (limits[0]-x2)*slope+y2
        calculated_beam.end.x = limits[0];
        calculated_beam.end.y = intersect_with_y;
    }


    //OlddrawLine(canvas.getContext('2d'), x2, y2,  intersect_with_x, limits[1], '#0558ff', 6)

    if(debug){console.log("x1",x1, "y1",y1,"x2", x2, "y2",y2, "slope",slope, "xdir", dir[0], "ydir" ,dir[1], "lim", limits)}
    return calculated_beam;


}

function getSlopeForPoints(x1, y1, x2, y2) {
    //calculate the slope
    return (y1 - y2) / (x1 - x2);
}


function redrawFigure(context){
    figure_lines.forEach(function(c){


        drawLine(context, c, '#000000', 6)


    })


}

function drawLine(context, line, stroke, thick){
    context.beginPath();
    context.moveTo(line.start.x, line.start.y);
    context.lineTo(line.end.x, line.end.y, thick);

    context.strokeStyle = stroke;
    context.stroke();

}

function clearCanvas(e)
{
    var canvas = document.getElementById('drawcanvas'),
        ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function resetAll(e){
    clearCanvas();
    figure_lines = []
    figure_points = []
    light_points = []
    document.getElementById("lineslist").innerHTML = "";
}
function addLineToList(line){

    var ul = document.getElementById("lineslist");
    var li = document.createElement("li");

    li.appendChild(document.createTextNode('['+ line.start.x + ','+ line.start.y + ' ] - ['+ line.end.x + ','+ line.end.y + ']'));
    ul.appendChild(li);


    //li.setAttribute("id", "element4");
}


function find_angle(A,B,C) {
    let AB = Math.sqrt(Math.pow(B.x-A.x,2)+ Math.pow(B.y-A.y,2));
    let BC = Math.sqrt(Math.pow(B.x - C.x, 2) + Math.pow(B.y - C.y, 2));
    let AC = Math.sqrt(Math.pow(C.x - A.x, 2) + Math.pow(C.y - A.y, 2));
    return Math.acos((BC*BC+AB*AB-AC*AC)/(2*BC*AB));
}

function findFirstIntersection(line, lines){
    let intersections = findIntersections(line, lines)

    if(intersections.length === 0 ){
        if(debug){console.log("No intersections")}
        return false;
    }

    while(intersections.length > 1) {

        let current_intersection = intersections.pop()
        intersections = findIntersections(new Line(line.start, intersect(line, current_intersection)), intersections)
        if(intersections.length === 0){
            if(debug){console.log("only intersection still possible")}
            intersections = [current_intersection];
            break;
        }
        else if(intersections.length === 1){
            if(debug){console.log("only one different possibility")}
            break;
        }
    }

        return intersections[0];

}
function findIntersections(line, lines){
    var intersecting_lines = []
    lines.forEach(function(figure_line){

        //OlddrawLine(document.getElementById('drawcanvas').getContext("2d"), line[0][0], line[0][1], line[1][0], line[1][1], '#ff0000', 6)

        let intersection = intersect(line, figure_line)

        if(intersection){

            intersecting_lines.push(figure_line)
        }
        //clearCanvas()
        //redrawFigure(document.getElementById('drawcanvas').getContext("2d"))
    })

    return intersecting_lines;
}

// line intercept math by Paul Bourke http://paulbourke.net/geometry/pointlineplane/
// Determine the intersection point of two line segments
// Return FALSE if the lines don't intersect
function intersect(line1, line2) {
    let x1 = line1.start.x
    let y1 = line1.start.y
    let x2 = line1.end.x
    let y2 = line1.end.y
    let x3 = line2.start.x
    let y3 = line2.start.y
    let x4 = line2.end.x
    let y4 = line2.end.y

    // Check if none of the lines are of length 0
    if ((x1 === x2 && y1 === y2) || (x3 === x4 && y3 === y4)) {
        return false
    }

    let denominator = ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1))

    // Lines are parallel
    if (denominator === 0) {
        return false
    }

    let ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denominator
    let ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denominator

    // is the intersection along the segments
    if (ua < 0 || ua > 1 || ub < 0 || ub > 1) {
        return false
    }

    // Return an array with the x and y coordinates of the intersection
    let x = x1 + ua * (x2 - x1)
    let y = y1 + ua * (y2 - y1)

    return new Point(x,y)
}

