import waveAlgorithm from "./distance.js";
import Creature from "./creature.js";
import {SPECS} from 'battlecode'
import Point from "./point.js";
export default class WalkingRobot extends Creature{
    constructor(_this){
        super(_this);
        this.currentPath = [];
        this.speed = this.robot.me.unit == SPECS.CRUSADER ? 9 : 4;
        this.makeHomeCordinates();
    }
    updatePath(dest) {
        this.currentPath = waveAlgorithm(this.robot.map, this.position, dest, this.robot.getVisibleRobots(), this.log.bind(this.robot));
    }
    removePath() {
        this.currentPath = [];
    }
    makeHomeCordinates(){
        this.robot.getVisibleRobotMap()
            .filter((_,i)=>i>=this.position.y-1 && i <= this.position.y + 1)
            .forEach((row,i)=>row
                .filter((_,j)=>j>=this.position.x-1 && j <= this.position.x + 1)
                .filter(c=>c > 0)
                .map(c=>this.robot.getRobot(c))
                .filter(c=>c.unit == SPECS.CASTLE || c.unit == SPECS.CHURCH)
                .forEach(c=>this.home = new Point(c.x,c.y)))
    }
    step(){
        let nextPoint = this.currentPath
            .filter(p=>this.position.distanceSq(p)<=this.speed)
            .reverse()
            .find(p=>!this.robot.getVisibleRobotMap()[p.y][p.x]);
        let index = nextPoint && this.currentPath.findIndex(c=>c.equal(nextPoint));
        this.currentPath.splice(0, index+1);
        if(!this.currentPath.length)
            this.removePath();
        return nextPoint && this.robot.move(...this.position.deltaArray(nextPoint))
    }
    do_someth(){
        this.updatePosition();
    }
}