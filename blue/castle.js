import Creature from "./creature.js";
import Point from './point.js';
import {SPECS} from 'battlecode'
export default class Castle extends Creature {

    constructor(_this) {
        super(_this);
        this.ignoreList = [];
        this.resMap = [];
        this.closestResource = undefined;
        this.makeResMap();
        this.mapIsFull = false;
        this.startSignal = false;
    }

    do_someth(ign) {
        if(this.robot.fuel>100&&this.robot.karbonite>40) {
            this.log('WE THINK THAT NOW MAP ' + this.mapIsFull)
            this.findNewClosest()
            this.log('CLOSEST RESOURCE TO US IS ' + this.closestResource)
            if (!this.mapIsFull) {
                this.sendResCoor();
                this.log("kek:" + this.robot.me.signal);
                let freePlace = this.position.deltaArray(this.findFreePlace()[0]);
                return this.robot.buildUnit(SPECS.PILGRIM, ...freePlace);
            }
        }
    }

    canAfford(unit, amount = 1) {
        let data = {
            [SPECS.CRUSADER]: {f: 50, c: 20},
            [SPECS.PROPHET]: {f: 50, c: 25},
            [SPECS.PREACHER]: {f: 50, c: 30},
            [SPECS.PILGRIM]: {f: 50, c: 10},
        };
        return data[unit].f * amount <= this.robot.fuel && data[unit].c * amount <= this.robot.karbonite;
    }

    countCastles() {
        return this.robot.getVisibleRobots()
            .filter(r => r.unit == SPECS.CASTLE)
            .reduce(x => x + 1, 1);
    }

    sendResCoor() {
        let x = this.closestResource.x;
        let y = this.closestResource.y;
        if(y<10)y = "0" + y;
        this.robot.signal(parseInt(x + "" + y), 2);
    }
    findNewClosest() {
        if (!this.mapIsFull) {
            this.closestResource = this.findClosestResource();
            if (typeof this.closestResource == "object")
                this.ignoreList.push(this.closestResource);
        }

    }
    findClosestResource() {
        let resources = [];
        let lengths = [];
        if (this.ignoreList.length) {
            this.ignoreList.forEach((el) => {
                this.resMap[el.y][el.x] = false
            });
        }
        for (let i = 0; i < this.width; i++) {
            for (let j = 0; j < this.width; j++) {
                if (this.resMap[i][j]) {
                    resources.push(new Point(j, i));
                    lengths.push(Math.sqrt(((i - this.position.y) * (i - this.position.y))
                        + ((j - this.position.x) * (j - this.position.x))));
                }
            }
        }
        if (resources[lengths.indexOf(Math.min(...lengths))] == undefined) {
            this.mapIsFull = true;
            return "kek";
        }
        return resources[lengths.indexOf(Math.min(...lengths))];
    }

    makeResMap() {
        this.resMap = new Array(this.width)
            .fill([])
            .map(() => new Array(this.width))
            .map(c => c.fill(false));
        let fx = 0, fy = 0, endx = this.width, endy = this.width;
         if(!this.X_Mirror) {
             if (this.position.x < this.width / 2)
                 endx = this.width/2;
             else
                 fx = this.width/2;
         }else {
            if (this.position.y < this.width / 2)
                 endy = this.width / 2;
             else
                 fy = this.width / 2;
         }
        for (let i = fy; i < endy; i++) {
            for (let j = fx; j < endx; j++) {
                if (this.robot.fuel_map[i][j] || this.robot.karbonite_map[i][j]) {
                    this.resMap[i][j] = true;
                    this.log('POINT ON OUR HALF AND HAS RESOURCES ' + j  + " "+ i)
                }
            }
        }
    }
}