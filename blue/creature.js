import Point from "./point.js";
import {SPECS} from 'battlecode';

export default class Creature {
    constructor(_this){
        this.robot = _this;
        this.log = _this.log.bind(_this);
        this.updatePosition();
        this.castles = [];
        this.position;

        this.width = this.robot.map.length;
    }
    updatePosition(){
        this.position = new Point(this.robot.me.x, this.robot.me.y);
    }

    findFreePlace(dest) {
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
        for (let i = Math.max(0, x - 1); i <= Math.min(this.width, x + 1); i++) {
            for (let j = Math.max(0, y - 1); j <= Math.min(this.width, y + 1); j++) {
                if (!robotsMap[j][i] && this.robot.map[j][i])
                    freeP.push(new Point(i, j));
            }
        }
        return freeP;
    }
}