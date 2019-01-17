import Point from "./point.js";
import {Combat} from "./combat.js";

export default class Crusader extends Combat {
    constructor(_this){
        super(_this);
        // 0 - readyToGoToEnemyCastle
        // 1 - canAttackEnemy
        // 2 - canAttackEnemyCastle
        this.actionType = 0;
        this.enemyCastle = this.enemyCastleLocation();
        this.attackRange = 16;
        this.enemiesNearBy = undefined
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
    enemyCastleLocation() {
        let point;
        if(this.scanMap())
            point =  new Point(this.home.x, this.width-1-this.home.y);
        else
            point = new Point(this.width-1-this.home.x, this.home.y);
        if(!point){
            this.log('ERROR BUT NOMATTER')
            throw new Error('CANT FIND ENEMIES CASTLE!!!')
        }
        this.log('WE THINK ENEMIES CASTLE IS IN ' + point.toString())
        return point;
    }
    removePath(){
        super.removePath();
        this.actionType = 2;
    }
    goToCastle() {
        this.updatePath(this.findFreePlace(this.enemyCastle, Math.sqrt(this.attackRange))[0], this.robot.getVisibleRobotMap());
        return this.step();
    }
    checkEnemies(){
        let enems = this.robot.getVisibleRobots()
            .filter(r=>r.team != this.robot.me.team)
            .filter(r=>new Point(r.x,r.y).distanceSq(this.position) <= this.attackRange);
        return enems.length && enems;
    }
    weakestEnemy(){
        return this.enemiesNearBy.reduce((weakest, current)=>
            !weakest ?
                current : current.health < weakest.health ? current : weakest)
    }
    do_someth(){
        if(this.enemiesNearBy = this.checkEnemies()) {
            this.log(this.enemiesNearBy.toString())
            this.actionType = 1;
        }
        else if(this.actionType == 1)
            this.actionType = 0;
        switch(this.actionType){
            case 0:
                this.log('toCASTLE MOOOOOOOOVe')
                return this.goToCastle();
            case 1:
                this.log('TIME TO ATTACK ENEMY')
                let enemy = this.weakestEnemy();
                return this.robot.attack(...new Point(enemy.x, enemy.y).deltaArray(this.position));
            case 2:
                this.log('HEY ITS MY AIM !!!')
                return this.robot.attack(...this.enemyCastle.deltaArray(this.position));
        }
    }
}