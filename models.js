export function Point(x, y) {
    this.x = x;
    this.y = y;
}

export function Line(start, end) {
    this.start = start
    this.end = end
    this.slope = function () {
        return (this.start.y - this.end.y) / (this.start.x - this.end.x);
    }
    this.direction = function () {
        return {x: this.end.x > this.start.x, y: this.end.y > this.start.y}
    }
    this.length = function(){
            return Math.hypot(this.end.x - this.start.x, this.end.y - this.start.y)
    }


}
