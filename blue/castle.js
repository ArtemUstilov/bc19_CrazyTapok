import Creature from "./creature.js";
import {SPECS} from 'battlecode'

export default class Castle extends Creature {
    constructor(_this) {
        super(_this);
        this.busyMines = new Set();
        this.closestResource = undefined;
        this.mapIsFull = false;
        this.currentFreePlace = undefined;
        this.checkDistantMines();
        this.actionType = 0;
        this.attackRange = 10;
        // 0 - create pilgrims, 1 - create crusaders, 2 - attack enemies
        this.step = -1;
        this.piligrims = 0;
        this.crusaders = 0;
    }
    checkDistantMines(){
        this.miningCode.forEach((m,i)=>{
            if(this.position.fastestPathLength(m, this.robot.map, this.robot.getVisibleRobotMap()) > 15)
                this.busyMines.add(i);
        })
    }
    recieveMsgs(){
        this.robot.getVisibleRobots()
            .filter(x => SPECS.CASTLE == x.unit)
            .filter(r=>r.castle_talk)
            .forEach(r => this.busyMines.add(255 - r.castle_talk))
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
        let index = this.miningCode.findIndex(c=>this.closestResource.equal(c))
        this.busyMines.add(index)
        this.robot.castleTalk(255 - index);
        this.robot.signal(index, 2);
    }
    findClosestResource() {
        let resources = [], lengths = [];
        this.miningCode
            .filter((_,i)=>!this.busyMines.has(i))
            .forEach((mineCell, index) => {
                resources.push(mineCell);
                lengths.push(this.position.distanceSq(mineCell))});
        if (resources.length == 1)
            this.mapIsFull = true;
        this.closestResource = resources[lengths.indexOf(Math.min(...lengths))];
    }
    updateActions(){
        if(this.enemiesNearBy.length)
            this.actionType = 2;
        else if (this.canAfford(SPECS.PILGRIM) && !this.mapIsFull && this.step < 100)
            this.actionType = 0;
        else if(this.canAfford(SPECS.CRUSADER) && this.robot.fuel > 500)
            this.actionType = 1;
        else
            this.actionType = -1;
    }
    do_someth(ign) {
        this.step++;
        this.recieveMsgs();
        this.checkEnemies();
        this.updateActions();
        switch (this.actionType){
            case 0:
                this.findClosestResource();
                this.sendResCoor();
                this.currentFreePlace = this.position.deltaArray(this.findFreePlace()[0]);
                if(this.currentFreePlace) {
                    this.piligrims++;
                    return this.robot.buildUnit(SPECS.PILGRIM, ...this.currentFreePlace);
                }
                break;
            case 1:
                this.currentFreePlace = this.position.deltaArray(this.findFreePlace()[0]);
                if(this.currentFreePlace) {
                    this.crusaders++;
                    return this.robot.buildUnit(SPECS.CRUSADER, ...this.currentFreePlace);
                }
                break;
            case 2:
                return this.attack(this.weakestEnemy())
        }

    }
}