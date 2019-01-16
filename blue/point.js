class Point {
    constructor(x,y){
        this.x = x;
        this.y = y;
    }
    equal(p){
        return p.x == this.x && p.y == this.y;
    }
    covertToArray(){
        return [this.x, this.y];
    }
    shift(dx,dy){
        return new Point(this.x+dx, this.y+dy);
    }
    insideSquare(size){
        return this.x >= 0 && this.y >= 0 && this.x < size && this.y < size;
    }
    distance(p){
        return Math.sqrt(Math.pow(p.x-this.x, 2) + Math.pow(p.y - this.y, 2));
    }
}
module.exports = Point