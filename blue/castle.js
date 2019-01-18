import Creature from "./creature.js";
import Point from './point.js';

export default class Castle extends Creature {

    constructor(_this) {
        super(_this);
        this.ignoreList = [];
        this.resMap = [];
        this.closestResource = undefined;
        this.makeResMap();
        this.mapIsFull = false;
        this.kek = true;
        this.startSignal =false;
    }

    do_someth(ign) {
        this.findNewClosest()
        if (!this.mapIsFull) {
            if (this.kek) {
                this.sendResCoor();
                this.log("kek:" + this.robot.me.signal);
                this.kek = false;
                return this.robot.buildUnit(2, 1, 0);


            }
        }
    }
    canAfford(unit, amount = 1){
        let data = {
            [SPECS.CRUSADER]: {f: 50, c: 20},
            [SPECS.PROPHET]: {f: 50, c: 25},
            [SPECS.PREACHER]: {f: 50, c: 30},
            [SPECS.PILGRIM]: {f: 50, c: 10},
        };
        return data[unit].f * amount <= this.robot.fuel && data[unit].c * amount <= this.robot.karbonite;
    }
    countCastles(){
        return this.robot.getVisibleRobots().filter(r=>r.unit == SPECS.CASTLE).reduce(x=>x+1, 1);
    }
    sendResCoor() {
            let mult = 0;

                if (this.closestResource.x.toString().length == 1 && this.closestResource.y.toString().length == 1) {
                    mult = 100;
                } else if (this.closestResource.x.toString().length == 2 && this.closestResource.y.toString().length == 1) {
                    mult = 100;
                } else if (this.closestResource.x.toString().length == 1 && this.closestResource.y.toString().length == 2) {
                    mult = 1000;
                } else if (this.closestResource.x.toString().length == 2 && this.closestResource.y.toString().length == 2) {
                    mult = 1000;
                }
                this.robot.signal(this.closestResource.x * mult + this.closestResource.y, 1);

}
findNewClosest()
{
        if(!this.mapIsFull) {
            this.closestResource = this.findClosestResource();
            if(typeof this.closestResource=="object")
            this.ignoreList.push(this.closestResource);
        }

}

findClosestResource()
{

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
    if(resources[lengths.indexOf(Math.min(...lengths))]==undefined){
        this.mapIsFull=true;
        return "kek";
    }
    return resources[lengths.indexOf(Math.min(...lengths))];
}

makeResMap()
{
    this.resMap = new Array(this.width)
        .fill([])
        .map(() => new Array(this.width))
        .map(c => c.fill(false));
    for (let i = 0; i < this.width; i++) {
        for (let j = 0; j < this.width; j++) {
            if (this.robot.fuel_map[i][j] || this.robot.karbonite_map[i][j]) {
                this.resMap[i][j] = true;
            }
        }
    }
}
}