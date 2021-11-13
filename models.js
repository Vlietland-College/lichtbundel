export function Point(x, y) {
    this.x = x;
    this.y = y;
}

export class Line{


    constructor(start, end) {
       this.start = start
        this.end = end

    }

    slope () {
        return (this.start.y - this.end.y) / (this.start.x - this.end.x);
    }
   direction() {
        return {x: this.end.x > this.start.x, y: this.end.y > this.start.y}
    }
   length (){
            return Math.hypot(this.end.x - this.start.x, this.end.y - this.start.y)
    }
}

export class RaphaelLine extends Line{
    constructor(start, end, raphael) {
        super(start, end);
        this.raphael = raphael
        this.node = raphael.path(this.getPath()).attr({
            stroke: "#000",
            "stroke-width": 1
        });
    }
    getPath() {
        return "M" + this.start.x + " " + this.start.y + " L" + this.end.x + " " + this.end.y;
    }

    redraw() {
        this.node.attr("path", this.getPath());
    }
    updateStart(x, y) {
        this.start.x = x;
        this.start.y = y;
        this.redraw();
        return this;
    }
    updateEnd(x, y) {
        this.end.x = x;
        this.end.y = y;
        this.redraw();
        return this;
    }


}
