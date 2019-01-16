import {BCAbstractRobot, SPECS} from 'battlecode';
import nav from './nav.js';
import Point from './point.js'
import path from './distance.js'
let step = -1;

class MyRobot extends BCAbstractRobot {
    constructor(){
        super();
        this.currentPath = [];
        this.isGoing = false;
        this.destination = undefined;
    }
    my_constructor(){
        this.updatePosition();
        this.width = this.map.length;
        this.speed = this.me.unit == SPECS.CRUSADER ? 9 : 4;
        if(this.map[20][20]) {
            this.updatePath(path(this.map, this.position, new Point(20, 20)))
        }
    }
    updatePath(path){
        this.currentPath = path;
        this.destination = path[path.length-1];
        this.isGoing = true;
    }
    removePath(){
        this.currentPath = [];
        this.destination = undefined;
        this.isGoing = false;
    }
    updatePosition(){
        this.position = new Point(this.me.x, this.me.y);
    }
    step(){
        let nextPoint = this.currentPath.shift();
        // while(this.currentPath.length &&
        //     this.position.distance(nextPoint) <= this.speed)
        //     nextPoint = this.currentPath.shift();
        // this.log(this.position.distance(nextPoint) + " " + this.speed)
        if(nextPoint.equal(this.destination))
            this.removePath();
        return this.position.deltaArray(nextPoint);
    }
    turn(){
        step++;
        if(!step)
           this.my_constructor();
        this.updatePosition();
        if(this.me.unit !== SPECS.CASTLE) {
            if(this.isGoing) {
                return this.move(...this.step());
            }
        }
        else if(!step)
            return this.buildUnit(SPECS.CRUSADER, 1, 0);
    }
}
