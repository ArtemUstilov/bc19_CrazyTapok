import waveAlgorithm from "./distance.js";
import Creature from "./creature.js";
import {SPECS} from 'battlecode'
import Point from "./point.js";
export default class WalkingRobot extends Creature{
    constructor(_this){
        super(_this);
        this.isGoing = false;
        this.destination = undefined;
        this.currentPath = [];
        this.home;
        this.makeHomeCordinates();
        this.speed = this.robot.me.unit == SPECS.CRUSADER ? 9 : 4;
    }
    updatePath(dest) {
        this.currentPath = waveAlgorithm(this.robot.map, this.position, dest);
        this.destination = this.currentPath[this.currentPath.length - 1];
        this.isGoing = true;
    }
    removePath() {
        this.currentPath = [];
        this.destination = undefined;
        this.isGoing = false;
    }
    makeHomeCordinates(){
        if(this.robot.me.unit == SPECS.CASTLE){
            this.home = new Point(this.position.x, this.position.y);
            return;
        }
        for(let i = Math.max(0, this.position.x - 1); i <= Math.min(this.width,this.position.x + 1); i++){
            for(let j = Math.max(0,this.position.y - 1); j <= Math.min(this.width,this.position.y + 1); j++) {
                let robot = this.robot.getVisibleRobotMap()[j][i];
                if (robot > 0) {
                    robot = this.robot.getRobot(robot);
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
    step(){
        let nextPoint;
        let possiblePoints = [];
        while(this.currentPath.length && this.position.distanceSq(this.currentPath[0]) <= this.speed) {
            possiblePoints.push(this.currentPath.shift());
        }
        for(let i = possiblePoints.length-1; i >= 0; i--){
            if(!this.robot.getVisibleRobotMap()[possiblePoints[i].y][possiblePoints[i].x]){
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
        return this.robot.move(...this.position.deltaArray(nextPoint))
    }
}