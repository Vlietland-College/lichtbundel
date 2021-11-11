var clicks = 0;
var lastClick = [0, 0];


document.addEventListener('DOMContentLoaded', startup, false);



function startup(e){
    document.getElementById('drawcanvas').addEventListener('click', canvasclicked, false);

    document.getElementById('clear').addEventListener('click', clearCanvas, false);


}
var figure_points = [];
var light_points = [];


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
        figure_points.push([x,y])
        if(figure_points.length >= 2){
            let x2 = figure_points.at(-2)[0];
            let y2 = figure_points.at(-2)[1];
            drawLine(context, x, y, x2, y2, '#000000', 6);

            addLineToList(x2, y2, x, y);
        }

    }
    else if(linetype === 'light'){
        if(light_points.length === 2){
            light_points = []
            clearCanvas()
            redrawFigure(context)
        }

        light_points.push([x,y])

        if(light_points.length === 2){
            //second new point
            drawLine(context, light_points[0][0], light_points[0][1], x, y, '#ff0000', 6)
        }

    }


}

function getLineToEnd(x1, y1, x2, y2){
    //calculate when the line hits the border


}

function redrawFigure(context){
    let last_c = null
    figure_points.forEach(function(c){

        if(last_c != null){
            drawLine(context, last_c[0], last_c[1], c[0], c[1], '#000000', 6)
        }
        last_c = c

    })


}

function drawLine(context, x1, y1, x2, y2, stroke, thick) {


    context.beginPath();
    context.moveTo(x1, y1);
    context.lineTo(x2, y2, thick);

    context.strokeStyle = stroke;
    context.stroke();



};

function clearCanvas(e)
{
    var canvas = document.getElementById('drawcanvas'),
        ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function addLineToList(x1,y1, x2, y2){

    var ul = document.getElementById("lineslist");
    var li = document.createElement("li");

    li.appendChild(document.createTextNode('['+ x1 + ','+ y1 + ' ] - ['+ x2 + ','+ y2 + ']'));
    ul.appendChild(li);


    //li.setAttribute("id", "element4");
}



// Check the direction these three points rotate
function RotationDirection(p1x, p1y, p2x, p2y, p3x, p3y) {
    if (((p3y - p1y) * (p2x - p1x)) > ((p2y - p1y) * (p3x - p1x)))
        return 1;
    else if (((p3y - p1y) * (p2x - p1x)) == ((p2y - p1y) * (p3x - p1x)))
        return 0;

    return -1;
}

function containsSegment(x1, y1, x2, y2, sx, sy) {
    if (x1 < x2 && x1 < sx && sx < x2) return true;
    else if (x2 < x1 && x2 < sx && sx < x1) return true;
    else if (y1 < y2 && y1 < sy && sy < y2) return true;
    else if (y2 < y1 && y2 < sy && sy < y1) return true;
    else if (x1 == sx && y1 == sy || x2 == sx && y2 == sy) return true;
    return false;
}

function hasIntersection(x1, y1, x2, y2, x3, y3, x4, y4) {
    var f1 = RotationDirection(x1, y1, x2, y2, x4, y4);
    var f2 = RotationDirection(x1, y1, x2, y2, x3, y3);
    var f3 = RotationDirection(x1, y1, x3, y3, x4, y4);
    var f4 = RotationDirection(x2, y2, x3, y3, x4, y4);

    // If the faces rotate opposite directions, they intersect.
    var intersect = f1 != f2 && f3 != f4;

    // If the segments are on the same line, we have to check for overlap.
    if (f1 == 0 && f2 == 0 && f3 == 0 && f4 == 0) {
        intersect = containsSegment(x1, y1, x2, y2, x3, y3) || containsSegment(x1, y1, x2, y2, x4, y4) ||
            containsSegment(x3, y3, x4, y4, x1, y1) || containsSegment(x3, y3, x4, y4, x2, y2);
    }

    return intersect;
}
