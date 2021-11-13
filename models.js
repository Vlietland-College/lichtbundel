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

export class cornerPoint{
    #friends = [];
    line;
    #point;

    constructor(point, line1, raphael) {
        this.#point = point
        this.#friends.push(line1)
        this.node = raphael.circle(this.#point.x, this.#point.y, 1).attr({fill:"#000"})
    }

    redraw(){
        this.node.attr({"cx":this.#point.x, "cy":this.#point.y})
    }

    activateMouseHover(){
        this.node.mouseover((e)=>{
            this.node.attr({
                r: 3,
            });

        })
        this.node.mouseout((e)=>{
            this.node.attr({
                r:1,
            });

        })
    }
    deactivateMouseHover(){
        this.node.unmouseover()
        this.node.unmouseout()
    }

}

export class RaphaelLine extends Line{
    constructor(start, end, raphael) {
        super(start, end);
        this.raphael = raphael
        this.node = raphael.path(this.getPath()).attr({
            stroke: "#000",
            fill:"#000",
            "stroke-width": 1
        });

        this.start_node = new cornerPoint(this.start, this, raphael)
        this.end_node = new cornerPoint(this.end, this, raphael)

    }
    getPath() {
        return "M" + this.start.x + " " + this.start.y + " L" + this.end.x + " " + this.end.y;
    }

    redraw() {
        this.node.attr("path", this.getPath());
        this.start_node.redraw()
        this.end_node.redraw()

    }
    activateMouseHover(){
        this.end_node.activateMouseHover()
        this.start_node.activateMouseHover()
        this.node.mouseover((e)=>{
            this.node.attr({
                stroke: "#000",
                fill:"#000",
                "stroke-width": 4
            });

        })
        this.node.mouseout((e)=>{
            this.node.attr({
                stroke: "#000",
                fill:"#000",
                "stroke-width": 1
            });

        })
    }
    deactivateMouseHover(){
        this.node.unmouseover()
        this.node.unmouseout()
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

export class lineMaker{
    #line;
    container;
    should_listen_for_newline = true;

    constructor(container, paper){
        this.container = container
        this.paper = paper
        this.listenForNewLine()
    }

    listenForNewLine(){
        this.container.addEventListener('mousedown', (e)=>{ this.newLine(e)}, {once:true});
    }

    setLine(line){
        this.#line = line
    }

    newLine(e){
        console.log(e)
        let x = e.offsetX;
        let y = e.offsetY;

        this.#line = new RaphaelLine(new Point(x, y), new Point(x, y), this.paper);
        this.startMove(e, false, true)
    }

    startMove(e, side = false, newline = false){
        console.log(this.#line)
        this.#line.deactivateMouseHover()


        this.mousemoveevent = (e) => {
            this.lineMouseMoved(e, side)
        }

        this.container.addEventListener('mousemove', this.mousemoveevent)

        if(newline && e.shiftKey){
            this.container.addEventListener('mousedown', (e) => {
                this.stopMove(e)
                this.newLine(e)
            }, {once:true})
        }
        else if (newline) {
            this.container.addEventListener('mouseup', (e) => {
                this.stopMove(e)
                if(e.shiftKey){
                    this.newLine(e)
                }

                else if(this.should_listen_for_newline){
                    this.listenForNewLine()
                }
            }, {once: true})
        }
        else{
            this.container.addEventListener('mouseup', (e) => {
                this.stopMove(e)
            }, {once: true})
        }
    }

    lineMouseMoved(e, side){
        let x = e.offsetX;
        let y = e.offsetY;

        side ? this.#line.updateStart(x, y) : this.#line.updateEnd(x, y)
    }

    stopMove(e){
        this.container.removeEventListener('mousemove', this.mousemoveevent)
        this.#line.activateMouseHover()

    }

}
