import Creature from "./creature.js";
import Point from './point.js';
import {SPECS} from 'battlecode'

export default class Castle extends Creature {

    constructor(_this) {
        super(_this);
        this.busyMines = new Set();
        this.closestResource = undefined;
        this.mapIsFull = false;
        this.currentFreePlace = undefined;
    }
    do_someth(ign) {
        this.robot.getVisibleRobots()
            .filter(x => x.team == this.robot.me.team)
            .filter(x => SPECS.PILGRIM == x.unit)
            .forEach(r => {
                if(r.castle_talk !== undefined){
                    this.busyMines.add(r.castle_talk)
                    this.log('added coordinata ' + this.miningCode[r.castle_talk].x + " " + this.miningCode[r.castle_talk].y)
                }})
        if (this.canAfford(SPECS.PILGRIM)) {
            this.findNewClosest();
            if (!this.mapIsFull) {
                this.sendResCoor();
                this.currentFreePlace = this.position.deltaArray(this.findFreePlace()[0]);
                return this.robot.buildUnit(SPECS.PILGRIM, ...this.currentFreePlace);
            }
        }
    }

    parseToObj(code) {
        let x = Math.floor(code / 100);
        let y = code % 100;
        return {x, y};
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
        if (y < 10) y = "0" + y;
        this.robot.signal(parseInt(x + "" + y), 2);
    }

    findNewClosest() {
        if (!this.mapIsFull) {
            this.closestResource = this.findClosestResource();
            if (this.closestResource){
                this.log(this.closestResource + " ITS CLOSEST RESOURCE")
                this.miningCode.forEach((c,i)=>{
                    if(this.closestResource.x == c.x && this.closestResource.y == c.y)
                        this.busyMines.add(i);
                })
            }
        }
    }
    findClosestResource() {
        let resources = [];
        let lengths = [];
        this.miningCode.forEach((mineCell, index)=>{
            if(!this.busyMines.has(index)){
                resources.push(mineCell);
                lengths.push(this.position.distanceSq(new Point(mineCell.x, mineCell.y)))
            }
        });
        if(!resources.length){
            this.mapIsFull = true;
            return;
        }
        return resources[lengths.indexOf(Math.min(...lengths))];
    }
}