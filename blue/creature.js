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
        this.X_Mirror = this.scanMap();
        this.miningCode = [];
        this.resMap = undefined;
        this.enemiesNearBy = [];
        this.attackRange;
        this.makeResMap()
        this.indexingMining();
    }
    inRange(dist){
        return dist <= this.attackRange
    }
    checkEnemies(){
        this.enemiesNearBy = this.robot.getVisibleRobots()
            .filter(r=>r.team != this.robot.me.team)
            .filter(r=>r.unit != SPECS.CASTLE)
            .map(r=>new Point(r.x,r.y))
            .filter(p=>this.inRange(p.distanceSq(this.position)));
    }
    weakestEnemy(){
        return this.enemiesNearBy.reduce((weakest, current)=>
            !weakest ?
                current : current.health < weakest.health ? current : weakest)
    }
    attack(aim){
        return this.robot.attack(...this.position.deltaArray(aim));
    }
    updatePosition(){
        this.position = new Point(this.robot.me.x, this.robot.me.y);
    }
    findFreePlace(dest, range = 1) {
        range = Math.floor(range)
        let freeP = [];
        let x = dest ? dest.x : this.position.x;
        let y = dest ? dest.y : this.position.y;
        this.robot.getVisibleRobotMap()
            .map((c,i)=>{return {c,i}})
            .filter(ob=>ob.i>=y-range && ob.i <= y + range)
            .forEach((row)=>row.c
                .map((obt,j)=>{return {c:obt,i:row.i,j}})
                .filter(o=>o.j>=x-range && o.j <= x + range)
                .filter(ob=>ob.c <= 0 && this.robot.map[ob.i][ob.j])
                .map(ob=>new Point(ob.j,ob.i))
                .filter(p=>range == 1 || range*range >= p.distanceSq(new Point(x,y)))
                .forEach(p=>freeP.push(p)));

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
                if (this.robot.fuel_map[i][j] || this.robot.karbonite_map[i][j]) {
                    this.resMap[i][j] = true;
                }
            }
        }
    }
    indexingMining(){
        this.robot.map.forEach((row,y)=>row.forEach((_,x)=>{
            if(this.resMap[y][x])
                this.miningCode.push(new Point(x,y))
        }))
    }
}