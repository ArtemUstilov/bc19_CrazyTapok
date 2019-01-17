import Point from "./point.js";
import {SPECS} from 'battlecode';

export default class Creature {
    constructor(_this){
        this.robot = _this;
        this.log = _this.log.bind(_this);
        this.updatePosition();
        this.castles = [];
        this.makeHomeCordinates();
        this.position;
        this.home;
        this.width = this.robot.map.length;
    }
    updatePosition(){
        this.position = new Point(this.robot.me.x, this.robot.me.y);
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
    findFreePlace() {
        let freeP = [];
        let robotsMap = this.robot.getVisibleRobotMap();
        for (let i = Math.max(0, this.position.x - 1); i <= Math.min(this.width, this.position.x + 1); i++) {
            for (let j = Math.max(0, this.position.y - 1); j <= Math.min(this.width, this.position.y + 1); j++) {
                if (!robotsMap[j][i] && this.robot.map[j][i])
                    freeP.push(new Point(i, j));
            }
        }
        return freeP;
    }
}