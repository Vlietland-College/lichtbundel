import {Line, Point} from "./models.js";
import {debug} from "./settings.js";

export function RotationDirection(p1, p2, p3) {

    if (((p3.y - p1.y) * (p2.x - p1.x)) > ((p2.y - p1.y) * (p3.x - p1.x)))
        return 1;
    else if (((p3.y - p1.y) * (p2.x - p1.x)) == ((p2.y - p1.y) * (p3.x - p1.x)))
        return 0;

    return -1;
}

export function getLineToEnd(line, canvas) {
    //calculate when the line hits the border to make it a finite line for intersection calculation
    let x1 = line.start.x
    let y1 = line.start.y
    let x2 = line.end.x
    let y2 = line.end.y

    let dir = line.direction()

    let calculated_beam = new Line(line.start, new Point(null, null))
    //calculate if x or y boundary is hit
    let limits = [dir.x ? canvas.width : 0, dir.y ? canvas.height : 0];

    //intersection point with x-axis
    let intersect_with_x = (limits[1] - y2) / line.slope() + x2

    if (0 < intersect_with_x && intersect_with_x < canvas.height) {
        //intersecting with x boundry
        if (debug) {
            console.log("intersecting x")
        }
        calculated_beam.end.x = intersect_with_x;
        calculated_beam.end.y = limits[1];

    } else {
        // intersecting with y boundry
        if (debug) {
            console.log("intersecting y")
        }
        let intersect_with_y = (limits[0] - x2) * line.slope() + y2
        calculated_beam.end.x = limits[0];
        calculated_beam.end.y = intersect_with_y;
    }


    //OlddrawLine(canvas.getContext('2d'), x2, y2,  intersect_with_x, limits[1], '#0558ff', 6)

    if (debug) {
        console.log("x1", x1, "y1", y1, "x2", x2, "y2", y2, "slope", line.slope(), "xdir", dir.x, "ydir", dir.y, "lim", limits)
    }
    return calculated_beam;


}

export function find_angle(A, B, C) {
    let AB = Math.sqrt(Math.pow(B.x - A.x, 2) + Math.pow(B.y - A.y, 2));
    let BC = Math.sqrt(Math.pow(B.x - C.x, 2) + Math.pow(B.y - C.y, 2));
    let AC = Math.sqrt(Math.pow(C.x - A.x, 2) + Math.pow(C.y - A.y, 2));
    return Math.acos((BC * BC + AB * AB - AC * AC) / (2 * BC * AB));

}

export function findMirrorPoint(alpha, A, B, rotation) {
    let length = lineDistance(A, B)
    let alt = false
    if (rotation === -1) {
        alt = true
    }
    let C = calculateThirdPoint(A, B, length, length, alpha * 2, alt)


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
    let uACx = (Cx - Ax) / b;
    let uACy = (Cy - Ay) / b;

    if (alt) {

        //rotated vector
        let uABx = uACx * Math.cos((A)) - uACy * Math.sin((A));
        let uABy = uACx * Math.sin((A)) + uACy * Math.cos((A));

        //B position uses length of edge
        Bx = Ax + c * uABx;
        By = Ay + c * uABy;
    } else {
        //vector rotated into another direction
        let uABx = uACx * Math.cos((A)) + uACy * Math.sin((A));
        let uABy = -uACx * Math.sin((A)) + uACy * Math.cos((A));

        //second possible position
        Bx = Ax + c * uABx;
        By = Ay + c * uABy;
    }

    return new Point(Bx, By);
}

export function findFirstIntersection(line, lines) {
    let intersections = findIntersections(line, lines)

    if (intersections.length === 0) {
        if (debug) {
            console.log("No intersections")
        }
        return false;
    }

    while (intersections.length > 1) {

        let current_intersection = intersections.pop()
        intersections = findIntersections(new Line(line.start, intersect(line, current_intersection)), intersections)
        if (intersections.length === 0) {
            if (debug) {
                console.log("only intersection still possible")
            }
            intersections = [current_intersection];
            break;
        } else if (intersections.length === 1) {
            if (debug) {
                console.log("only one different possibility")
            }
            break;
        }
    }

    return intersections[0];

}

function findIntersections(line, lines) {
    var intersecting_lines = []
    lines.forEach(function (figure_line) {

        let intersection = intersect(line, figure_line)

        if (intersection) {

            intersecting_lines.push(figure_line)
        }
    })

    return intersecting_lines;
}

// line intercept math by Paul Bourke http://paulbourke.net/geometry/pointlineplane/
// Determine the intersection point of two line segments
// Return FALSE if the lines don't intersect
export function intersect(line1, line2) {
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

    return new Point(x, y)
}
