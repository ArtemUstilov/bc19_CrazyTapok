import {BCAbstractRobot, SPECS} from 'battlecode';
import Point from './point.js'
import path from './distance.js'
import {Combat as Crusader, Combat as Preacher, Combat as Prophet} from './combat.js'
import Piligrim from './piligrim.js'
let step = -1;

class MyRobot extends BCAbstractRobot {
    constructor(){
        super();
        this.currentPath = [];
        this.isGoing = false;
        this.destination = undefined;
        this.home;
        this.castles = [];
    }
    my_constructor(){
        this.updatePosition();
        this.width = this.map.length;
        this.makeHomeCordinates();
        this.speed = this.me.unit == SPECS.CRUSADER ? 9 : 4;
          switch (this.me.unit) {
            case SPECS.PILGRIM:
                this.unit = new Piligrim(this);
                break;
            case SPECS.CRUSADER:
                this.unit = new Crusader(this);
                break;
            case SPECS.PREACHER:
                this.unit = new Preacher(this);
                break;
            case SPECS.PROPHET:
                this.unit = new Prophet(this);
                break;
        }
        if(this.me.unit == SPECS.PILGRIM) {
            this.log('send' + this.position)
            this.unit.do_someth(this.fuel_map,[]);
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
        if(this.me.unit == SPECS.PILGRIM)
            {
               
            }
        //this.unit.do_someth();
         if(this.me.unit !== SPECS.CASTLE) {
             if(this.isGoing) {
                 return this.step();
             }
         }
         else if(!step)
             return this.buildUnit(2, 1, 0);
        //if(step==1&& this.me.unit == 0)return this.give(1, 0, 20, 20);
    }
    makeHomeCordinates(){
        if(this.me.unit == SPECS.CASTLE){
            this.home = new Point(this.me.x, this.me.y);
            return;
        }
        for(let i = Math.max(0, this.me.x - 1); i <= Math.min(this.width,this.me.x + 1); i++){
            for(let j = Math.max(0,this.me.y - 1); j <= Math.min(this.width,this.me.y + 1); j++) {
                let robot = this.getVisibleRobotMap()[j][i];
                if (robot > 0) {
                    robot = this.getRobot(robot);
                    if (robot.unit == SPECS.CASTLE || robot.unit == SPECS.CHURCH) {
                        let p = new Point(robot.x, robot.y);
                        if(robot.unit == SPECS.CASTLE)
                            this.castles.push(p);
                        this.home = p;
                        return;
                    }
                }
            }
        }
    }
}
