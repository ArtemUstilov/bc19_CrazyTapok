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
        this.attackRange = 16;
        this.enemiesNearBy = undefined
    }
    goToCastle() {
        let dest = this.findFreePlace(this.enemyCastle, Math.sqrt(this.attackRange)-1)[0];
        this.updatePath(dest, this.robot.getVisibleRobotMap());
        return this.step();
    }
    attack(aim){
        return this.robot.attack(...this.position.deltaArray(aim));
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
    updateActions(){
        if(this.inRange(this.position.distanceSq(this.enemyCastle)))
            this.actionType = 2;
        else if(this.enemiesNearBy && this.enemiesNearBy.length)
            this.actionType = 1;
        else
            this.actionType = 0;
    }
    do_someth(){
        super.do_someth();
        this.checkEnemies();
        this.updateActions();
        switch(this.actionType){
            case 0:
                return this.goToCastle();
            case 1:
                return this.attack(this.weakestEnemy());
            case 2:
                return this.attack(this.enemyCastle);
        }
    }
}