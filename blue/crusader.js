import Point from "./point.js";
import {Combat} from "./combat.js";
import {SPECS} from 'battlecode'
export default class Crusader extends Combat {
    constructor(_this){
        super(_this);
        // 0 - readyToGoToEnemyCastle
        // 1 - canAttackEnemy
        // 2 - canAttackEnemyCastle
        this.actionType = 0;
        this.enemyCastle = this.enemyCastleLocation();
        this.log('SO enemy castle is about ' + this.enemyCastle.toString())
        this.attackRange = 16;
        this.enemiesNearBy = undefined
    }
    enemyCastleLocation() {
        let point;
        if(this.X_Mirror)
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
        let dest = this.findFreePlace(this.enemyCastle, Math.sqrt(this.attackRange)-1)[0];
        this.updatePath(dest, this.robot.getVisibleRobotMap());
        return this.step.call(this);
    }
    checkEnemies(){
        let enems = this.robot.getVisibleRobots()
            .filter(r=>r.team != this.robot.me.team)
            .filter(r=>r.unit != SPECS.CASTLE)
            .filter(r=>new Point(r.x,r.y).distanceSq(this.position) <= this.attackRange);
        return enems.length && enems;
    }
    weakestEnemy(){
        return this.enemiesNearBy.reduce((weakest, current)=>
            !weakest ?
                current : current.health < weakest.health ? current : weakest)
    }
    do_someth(){
        this.updatePosition();
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
                return this.robot.attack(...this.position.deltaArray(new Point(enemy.x, enemy.y)));
            case 2:
                this.log('HEY ITS MY AIM !!!')
                return this.robot.attack(...this.position.deltaArray(this.enemyCastle));
        }
    }
}