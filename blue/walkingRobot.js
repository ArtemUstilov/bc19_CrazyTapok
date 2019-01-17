import waveAlgorithm from "./distance.js";
import Creature from "./creature.js";
import {SPECS} from 'battlecode'
export default class WalkingRobot extends Creature{
    constructor(_this){
        super(_this);
        this.isGoing = false;
        this.destination = undefined;
        this.currentPath = [];
        this.speed = this.robot.me.unit == SPECS.CRUSADER ? 9 : 4;
    }
    updatePath(dest, robotsMap) {
        this.currentPath = waveAlgorithm(this.robot.map, this.position, dest, robotsMap);
        this.destination = this.currentPath[this.currentPath.length - 1];
        this.isGoing = true;
    }
    removePath() {
        this.currentPath = [];
        this.destination = undefined;
        this.isGoing = false;
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