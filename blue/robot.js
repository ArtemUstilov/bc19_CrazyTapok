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
        if(this.me.unit != SPECS.CASTLE && this.map[20][20]) {
            this.log('send' + this.position)
            this.updatePath(path(this.map, this.position, new Point(20, 20)))
        }else if(!this.map[20][20])
            this.log('stay')
        // this.log(this.map)
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
        let nextPoint;
        let possiblePoints = [];
        while(this.currentPath.length && this.position.distanceSq(this.currentPath[0]) <= this.speed) {
                possiblePoints.push(this.currentPath.shift());
        }
        for(let i = possiblePoints.length-1; i >= 0; i--){
            if(!this.getVisibleRobotMap()[possiblePoints[i].y][possiblePoints[i].x]){
                nextPoint = possiblePoints[i];
                for(let j = possiblePoints.length-1; j >= i+1 ; j--){
                    this.currentPath.unshift(possiblePoints[j]);
                }
                break;
            }
        }
        if(!this.currentPath.length)
            this.removePath();
        if(!nextPoint)
            return;
        return this.move(...this.position.deltaArray(nextPoint))
    }
    turn(){
        step++;
        if(!step)
           this.my_constructor();
        this.updatePosition();
        if(this.me.unit !== SPECS.CASTLE) {
            if(this.isGoing) {
                return this.step();
            }
        }
        else if(!step)
            return this.buildUnit(SPECS.CRUSADER, 1, 0);
    }
}