import Point from "./point.js";
import {SPECS} from 'battlecode';

export default class Creature {
    constructor(_this){
        this.robot = _this;
        this.log = _this.log.bind(_this);
        this.castles = [];
        this.position;
        this.width = this.robot.map.length;
        this.home;
        this.updatePosition();
        this.makeHomeCordinates();
        this.X_Mirror = this.scanMap();
        this.miningCode = [];
        this.resMap = undefined;
        this.makeResMap()
        this.indexingMining();
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
        if (dest) {
            x = dest.x;
            y = dest.y;
        } else {
            x = this.position.x;
            y = this.position.y;
        }
        if(!robotsMap)
            this.log('ROBOTS MAP CAN NOT WORK!!!!!!')
        for (let i = Math.max(0, x - range); i <= Math.min(this.width, x + range); i++) {
            for (let j = Math.max(0, y - range); j <= Math.min(this.width, y + range); j++) {
                if (robotsMap[j][i] <= 0 && this.robot.map[j][i] && (range == 1 || range*range >= new Point(i,j).distanceSq(new Point(x,y))))
                    freeP.push(new Point(i, j));
            }
        }
        if (freeP.length < 1)
            this.log("WOOOOOOOOOOOOW CANT FIND FREE SPACE, GEY")
        return freeP;
    }
    scanMap(){
        // true - по горизонтали, false - по вертикали
        for(let i = 0; i<this.width;i++) {
            for(let j = 0; j<this.width;j++) {
                if(j == this.width/2)
                    break;
                if(this.robot.fuel_map[i][j] && !this.robot.fuel_map[i][this.width-1-j])
                    return true;
            }
        }
        return false;
    }
    makeResMap() {
        this.resMap = new Array(this.width)
            .fill([])
            .map(() => new Array(this.width))
            .map(c => c.fill(false));
        let fx = 0, fy = 0, endx = this.width, endy = this.width;
        if (!this.X_Mirror) {
            if (this.position.x < this.width / 2)
                endx = this.width / 2;
            else
                fx = Math.floor(this.width / 2);
        } else {
            if (this.position.y < this.width / 2)
                endy = this.width / 2;
            else
                fy = Math.floor(this.width / 2);
        }
        for (let i = fy; i < endy; i++) {
            for (let j = fx; j < endx; j++) {
                if(!this.robot.fuel_map[i])
                    this.log(i)
                if (this.robot.fuel_map[i][j] || this.robot.karbonite_map[i][j]) {
                    this.resMap[i][j] = true;
                }
            }
        }
    }
    indexingMining(){
        this.robot.map.forEach((row,y)=>row.forEach((_,x)=>{
            if(this.resMap[y][x])
                this.miningCode.push({x,y})
        }))
    }
}