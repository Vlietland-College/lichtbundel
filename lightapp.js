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
var light_lines = [];

function Point(x, y) {
    this.x = x;
    this.y = y;
}

function Line(start, end){
    this.start = start
    this.end = end
    this.slope = function(){
        return (this.start.y - this.end.y) / (this.start.x - this.end.x);
    }
    this.direction = function(){
        return {x:this.end.x>this.start.x, y:this.end.y>this.start.y}
    }


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

            addLineToList(new_line, "lineslist");
        }

    }
    else if(linetype === 'light'){
        if(light_points.length === 2){
            resetLight()
            clearCanvas()
            redrawFigure(context)
        }

        light_points.push(new Point(x,y))

        if(light_points.length === 2){
            if(debug){console.log("[##### NEW LIGHTS RUN #####]")}
            //second new point
            if(debug){console.log("light real", light_points[0].x, light_points[0].y, light_points[1].x, light_points[1].y)}


            let hit_wall = false;
            let last_line = new Line(light_points[0], light_points[1])
            let last_intersection;

            let line_number = 0;


            while(!hit_wall) {


                if(line_number > 100){
                    break;
                }
                if(debug){console.log("Doing line", line_number)}

                let calculated_beam = getLineToEnd(last_line, this)
                let valid_figure_lines = [...figure_lines]

                if(last_intersection){
                    let index = valid_figure_lines.indexOf(last_intersection);
                    if (index > -1) {
                        valid_figure_lines.splice(index, 1);
                    }
                }

                let first_intersection = findFirstIntersection(calculated_beam, valid_figure_lines)


                if (first_intersection) {
                    //there are intersections
                    let first_intersection_point = intersect(calculated_beam, first_intersection)
                    last_intersection = first_intersection

                    calculated_beam.end = first_intersection_point
                    last_line = getMirroredBeam(calculated_beam, first_intersection, first_intersection_point)


                    light_lines.push(calculated_beam)


                }
                else{
                    //no intersections found, last line
                    hit_wall = true
                    last_line = calculated_beam
                    light_lines.push(last_line)

                }
                line_number += 1;


            }
            light_lines.forEach(function (light_line){
                addLineToList(light_line, "lightlist");
                drawLine(context, light_line, '#ff0000', 6)
            })


        }

    }


}

function drawLight(){


}

function getMirroredBeam(light, mirror, intersection_point){
    let angle = find_angle(light.start, intersection_point, mirror.start)

    let real_angle = angle
    let side = true



    if(angle === Math.PI*0.5){
        console.log("haaks joehoe")

    }
    else if(angle > Math.PI*0.5){
        side = false
        angle = Math.PI - angle

    }

    //calculate the rotation direction of the mirror - intersect - light to determine the rotation direction for the reflected beam
    let rotate = RotationDirection(side?mirror.start:mirror.end, intersection_point, light.start)
    let point_c =  findMirrorPoint( Math.PI * 0.5 - angle, intersection_point, light.start, rotate )


    let mirror_line =  new Line(intersection_point, point_c)

    //console.log("angle", angle, "real", real_angle, "angle/slope", angle/light.slope(), "light slope",light.slope(),"beam slope", mirror_line.slope(), "mirror_slope", mirror.slope())

    return mirror_line;



}




function getLineToEnd(line, canvas){
    //calculate when the line hits the border to make it a finite line for intersection calculation
    let x1 = line.start.x
    let y1 = line.start.y
    let x2 = line.end.x
    let y2 = line.end.y

    let dir = line.direction()

    let calculated_beam = new Line(line.start, new Point(null,null))
    //calculate if x or y boundary is hit
    let limits = [dir.x ? canvas.width : 0, dir.y ? canvas.height : 0];

    //intersection point with x-axis
    let intersect_with_x = (limits[1]-y2)/line.slope()+x2

    if(0 < intersect_with_x &&  intersect_with_x < canvas.height){
        //intersecting with x boundry
        if(debug){console.log("intersecting x")}
        calculated_beam.end.x = intersect_with_x;
        calculated_beam.end.y = limits[1];

    }
    else{
        // intersecting with y boundry
        if(debug){console.log("intersecting y")}
        let intersect_with_y = (limits[0]-x2)*line.slope()+y2
        calculated_beam.end.x = limits[0];
        calculated_beam.end.y = intersect_with_y;
    }


    //OlddrawLine(canvas.getContext('2d'), x2, y2,  intersect_with_x, limits[1], '#0558ff', 6)

    if(debug){console.log("x1",x1, "y1",y1,"x2", x2, "y2",y2, "slope",line.slope(), "xdir", dir.x, "ydir" ,dir.y, "lim", limits)}
    return calculated_beam;


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
    document.getElementById("lineslist").innerHTML = "Lines: ";
    resetLight()
}

function resetLight(){
    document.getElementById("lightlist").innerHTML = "lights: ";
    light_points = []
    light_lines = []
}
function addLineToList(line, list){

    var ul = document.getElementById(list);
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

function findMirrorPoint(alpha, A, B, rotation){
    let length = lineDistance(A, B)
    let alt=false
    if(rotation === -1){
        alt=true
    }
    let C  = calculateThirdPoint(A, B, length, length, alpha*2, alt)


    return C
}

function lineDistance(p1, p2) {
    return Math.hypot(p2.x - p1.x, p2.y - p1.y)
}

function calculateThirdPoint(p1, p2, b, c, A, alt) {

    var Bx;
    var By;

    alt = typeof alt === 'undefined' ? false : alt;
    let Ax = p1.x
    let Ay = p1.y
    let Cx = p2.x
    let Cy = p2.y


    //unit vector
    uACx = (Cx - Ax) / b;
    uACy = (Cy - Ay) / b;

    if(alt) {

        //rotated vector
        uABx = uACx * Math.cos((A)) - uACy * Math.sin((A));
        uABy = uACx * Math.sin((A)) + uACy * Math.cos((A));

        //B position uses length of edge
        Bx = Ax + c * uABx;
        By = Ay + c * uABy;
    }
    else {
        //vector rotated into another direction
        uABx = uACx * Math.cos((A)) + uACy * Math.sin((A));
        uABy = - uACx * Math.sin((A)) + uACy * Math.cos((A));

        //second possible position
        Bx = Ax + c * uABx;
        By = Ay + c * uABy;
    }

    return new Point(Bx, By);
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

function RotationDirection(p1,p2,p3) {

    if (((p3.y - p1.y) * (p2.x - p1.x)) > ((p2.y - p1.y) * (p3.x - p1.x)))
        return 1;
    else if (((p3.y - p1.y) * (p2.x - p1.x)) == ((p2.y - p1.y) * (p3.x - p1.x)))
        return 0;

    return -1;
}

