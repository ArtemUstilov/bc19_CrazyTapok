import Point from "./point.js";
import {SPECS} from 'battlecode';

export default class Creature {
    constructor(_this){
        this.robot = _this;
        this.log = _this.log.bind(_this);
        this.castles = [];
        this.position = undefined;
        this.width = this.robot.map.length;
        this.home;
        this.updatePosition();
        this.makeHomeCordinates();
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
    findFreePlace(dest, range = 1) {
        let freeP = [];
        let robotsMap = this.robot.getVisibleRobotMap();
        let x, y;
        if(dest){
            x = dest.x;
            y = dest.y;
        }else{
           x = this.position.x;
           y = this.position.y;
        }
        for (let i = Math.max(0, x - range); i <= Math.min(this.width, x + range); i++) {
            for (let j = Math.max(0, y - range); j <= Math.min(this.width, y + range); j++) {
                if (robotsMap[j][i] <= 0 && this.robot.map[j][i])
                    freeP.push(new Point(i, j));
            }
        }
        if(freeP.length < 1)
            this.log("WOOOOOOOOOOOOW CANT FIND FREE SPACE, GEY")
        return freeP;
    }
}