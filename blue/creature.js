import Point from "./point.js";
import {SPECS} from 'battlecode';

export default class Creature {
    constructor(_this){
        this.addAllProps(_this);
        this.castles = [];
        this.updatePosition();
        this.makeHomeCordinates();
        this.position;
        this.home;
        this.width = this.map.length;
    }
    addAllProps(_this){
        for (const key of Object.keys(_this)) {
            _this.log(key)
            this[key] = _this[key];
        }
        this.getVisibleRobotMap = _this.getVisibleRobotMap.bind(_this);
        this.getRobot = _this.getRobot.bind(_this);
        this.log = _this.log.bind(_this);
        this.mine = _this.mine.bind(_this);
        this.move = _this.move.bind(_this);
    }
    updatePosition(){
        this.position = new Point(this.me.x, this.me.y);
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
    findFreePlace() {
        let freeP = [];
        let robotsMap = this.getVisibleRobotMap();
        for (let i = Math.max(0, this.me.x - 1); i <= Math.min(this.width, this.me.x + 1); i++) {
            for (let j = Math.max(0, this.me.y - 1); j <= Math.min(this.width, this.me.y + 1); j++) {
                if (!robotsMap[j][i] && this.map[j][i])
                    freeP.push(new Point(i, j));
            }
        }
        return freeP;
    }
}