//class to point
import waveAlgorithm from "./distance.js";

export default class Point {
    constructor(x,y){
        this.x = x;
        this.y = y;
    }
    equal(p){
        //equality
        return p.x == this.x && p.y == this.y;
    }
    covertToArray(){
        //to array
        return [this.x, this.y];
    }
    shift(dx,dy){
        //returns new moved point
        return new Point(this.x+dx, this.y+dy);
    }
    insideSquare(size){
        //is this point within square
        return this.x >= 0 && this.y >= 0 && this.x < size && this.y < size;
    }
    distanceSq(p){
        //distance from a to b
        return Math.pow(p.x-this.x, 2) + Math.pow(p.y - this.y, 2);
    }
    fastestPathLength(p, map, robots){
        return waveAlgorithm(map, this, p, robots).length;
    }
    deltaArray(p){
        //shift from a to b
        return [p.x-this.x, p.y-this.y];
    }
    toString(){
        return `Point [${this.x}, ${this.y}]`.toString();
    }
}
