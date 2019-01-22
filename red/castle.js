import Creature from "./creature.js";
import {SPECS} from 'battlecode'
import Point from "./point.js";

export default class Castle extends Creature {
    constructor(_this) {
        super(_this);
        this.busyMines = new Set();
        this.closestResource = undefined;
        this.mapIsFull = false;
        this.currentFreePlace = undefined;
        this.checkDistantMines();
        this.actionType = 'freeze';
        this.attackRange = 10;
        this.circle = {}
        // 'pilgrim' - create pilgrims,
        // 'crusader_A' - create crusaders attackers,
        // 'crusader_D' - create crusaders defenders,
        // 'prophet_A' - create prophets defenders,
        // 'prophet_D' - create prophets atackers,
        // 'attack' - attack enemies
        this.step = -1;
        this.piligrims = 0;
        this.crusaders = 0;
        this.prophets = 0;
        this.radiusDef = {
            [SPECS.CRUSADER]:5,
            [SPECS.PROPHET]:3,
        }
        this.enemyCastle = this.enemyCastleLocation();
        this.radiusDefPositions(this.radiusDef[SPECS.PROPHET]);
        this.radiusDefPositions(this.radiusDef[SPECS.CRUSADER]);
    }
    enemyCastleLocation() {
        let point;
        if(this.X_Mirror)
            point =  new Point(this.position.x, this.width-1-this.position.y);
        else
            point = new Point(this.width-1-this.position.x, this.position.y);
        if(!point)
            throw new Error('CANT FIND ENEMIES CASTLE!!!')
        return point;
    }
    checkDistantMines(){
        this.miningCode.forEach((m,i)=>{
            if(this.position.fastestPathLength(m, this.robot.map, this.log.bind(this.robot)) > 15)
                this.busyMines.add(i);
        })
    }
    recieveMsgs(){
        this.robot.getVisibleRobots()
            .filter(x => SPECS.CASTLE == x.unit)
            .filter(r=>r.castle_talk)
            .forEach(r => this.busyMines.add(255 - r.castle_talk))
    }
    radiusDefPositions(R){
        let pos = [];
        let {x,y} = this.position;
        let dist = this.position.distanceSq(this.enemyCastle)
        this.robot.map
            .map((row,i)=>{return {row,i}})
            .filter(ob=>ob.i>=y-R && ob.i <= y + R)
            .forEach((ob)=>{
                let X = Math.round(Math.sqrt(R*R - Math.pow(ob.i - y, 2)))
                let X1 = X + x;
                let X2 = -X + x;
                if(ob.row[X1])
                    pos.push(new Point(X1,ob.i));
                if(ob.row[X2] && X2 != X1)
                    pos.push(new Point(X2,ob.i));
            })
        this.circle[`radius${R}`] = pos
            .filter(point=>!this.resMap[point.y][point.x])
            .filter(p=>p.distanceSq(this.enemyCastle) <= dist)
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
        //XXX : Artem don`t work properly
        throw new Error('Error');
        return this.robot.getVisibleRobots()
            .filter(r => r.unit == SPECS.CASTLE)
            .reduce(x => x + 1, 1);
    }
    sendResCoor() {
        if(!this.closestResource)return 0;
        let index = this.miningCode.findIndex(c=>this.closestResource.equal(c))
        this.busyMines.add(index)
        this.robot.castleTalk(255 - index);
        this.robot.signal(index, 2);
        return 1;
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
            this.actionType = 'attack';
        else if (!this.mapIsFull) {
            if (this.canAfford(SPECS.PILGRIM) && this.robot.fuel > 500)
                this.actionType = 'pilgrim';
        } else if(this.canAfford(SPECS.CRUSADER) && this.robot.fuel > 500){
            this.actionType = 'crusader_A'
        } else
            this.actionType = 'freeze'
    }
    makeProphet(behavior){
        if(!this.canAfford(SPECS.PROPHET))
            return;
        this.currentFreePlace = this.position.deltaArray(this.findFreePlace()[0]);
        if(this.currentFreePlace) {
            this.prophets++;
            if(!this.sendBehav(behavior, SPECS.PROPHET))
                return;
            return this.robot.buildUnit(SPECS.PROPHET, ...this.currentFreePlace);
        }
    }
    makePilgrim(){
        if(!this.canAfford(SPECS.PILGRIM))
            return;
        this.findClosestResource();
        if(!this.sendResCoor())return;
        this.currentFreePlace = this.position.deltaArray(this.findFreePlace()[0]);
        if(this.currentFreePlace) {
            this.piligrims++;
            return this.robot.buildUnit(SPECS.PILGRIM, ...this.currentFreePlace);
        }
    }
    sendBehav(behavior, unit){
        if(behavior == 1){
            let dest = this.circle[`radius${this.radiusDef[unit]}`].pop();
            if(!dest)return 0;
            let x = dest.x < 10 ? '0' + dest.x : dest.x;
            let y = dest.y < 10 ? '0' + dest.y : dest.y;
            behavior+=x+''+y;
        }
        this.robot.signal(+behavior, 2);
        return 1;
    }
    makeCrusader(behavior){
        if(!this.canAfford(SPECS.CRUSADER))
            return;
        this.currentFreePlace = this.position.deltaArray(this.findFreePlace()[0]);
        if(this.currentFreePlace) {
            this.crusaders++;
            if(!this.sendBehav(behavior, SPECS.CRUSADER))
                return;
            return this.robot.buildUnit(SPECS.CRUSADER, ...this.currentFreePlace);
        }
    }
    do_someth(ign) {
        this.step++;
        this.recieveMsgs();
        this.checkEnemies();
        this.updateActions();
        switch (this.actionType){
            case 'pilgrim':
                return this.makePilgrim();
            case 'crusader_D':
                return this.makeCrusader(1); // defender
            case 'crusader_A':
                return this.makeCrusader(2); // attacker
            case 'prophet_D':
                return this.makeProphet(1); // defender
            case 'prophet_A':
                return this.makeProphet(2); // attacker
            case 'attack':
                return this.attack(this.weakestEnemy());
            case 'freeze':
                return;
            default:
                throw new Error('ILLEGAL ACTION TYPE')
        }

    }
}