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
    }
    goToCastle() {
        let dest = this.findFreePlace(this.enemyCastle, Math.sqrt(this.attackRange)-1)[0];
        this.updatePath(dest, this.robot.getVisibleRobotMap());
        return this.step();
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