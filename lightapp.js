import {
    find_angle,
    findFirstIntersection,
    findMirrorPoint,
    getLineToEnd,
    intersect,
    RotationDirection
} from "./math.js";
import {Line, Point} from "./models.js";
import {debug, max_number_of_collisions} from "./settings.js";


document.addEventListener('DOMContentLoaded', startup, false);



function startup(e){

    var container = document.getElementById("raphaelContainer");
    document.getElementById('raphaelContainer').addEventListener('mousedown', canvasclicked, false);
    var paper = Raphael(container, 600, 600);

    document.getElementById('clear').addEventListener('click', resetAll, false);


}
var figure_points = [];
var figure_lines = [];

var light_points = [];
var light_lines = [];

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
        let clicked_point = new Point(x,y)

        if(light_points.length === 1 && clicked_point.x === light_points[0].x && clicked_point.y === light_points[0].y){
            //same spot as prev point
            return;
        }

        light_points.push(clicked_point)

        if(light_points.length === 2){
            if(debug){console.log("[##### NEW LIGHTS RUN #####]")}
            //second new point
            if(debug){console.log("light real", light_points[0].x, light_points[0].y, light_points[1].x, light_points[1].y)}


            let hit_wall = false;
            let last_line = new Line(light_points[0], light_points[1])
            let last_intersection;

            let line_number = 0;
            let time_reached_max = 0;

            while(!hit_wall) {


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
                    if(line_number >= max_number_of_collisions*(time_reached_max+1)){
                        drawLight(context)
                        setCollisionNumber(line_number)

                        if (confirm("We've hit " + line_number + " collisions! Continue? ")) {
                            time_reached_max += 1;
                        } else {
                            // Stop!
                           break;
                        }
                    }

                }
                else{
                    //no intersections found, last line
                    hit_wall = true
                    last_line = calculated_beam
                    light_lines.push(last_line)

                }

                line_number += 1;


            }
            clearCanvas()

            redrawFigure(context)

            setCollisionNumber(line_number)

            drawLight(context);


        }

    }


}


function drawLight(context) {
    light_lines.forEach(function (light_line) {
        addLineToList(light_line, "lightlist");
        drawLine(context, light_line, '#ff0000', 6)
    })
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
    document.getElementById("collisionnumber").innerHTML = "";
    light_points = []
    light_lines = []
}

function setCollisionNumber(number){
    document.getElementById("collisionnumber").innerHTML = number;
}


function addLineToList(line, list){

    var ul = document.getElementById(list);
    var li = document.createElement("li");

    li.appendChild(document.createTextNode('['+ Math.round(line.start.x) + ','+ Math.round(line.start.y) + ' ] - ['+ Math.round(line.end.x) + ','+ Math.round(line.end.y) + ']'));
    ul.appendChild(li);


    //li.setAttribute("id", "element4");
}




