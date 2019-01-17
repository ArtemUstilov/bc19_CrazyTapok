import WalkingRobot from "./walkingRobot";
import Point from "./point";
import findClosestResource from "./mapScan";

export class Combat extends WalkingRobot {
    constructor(_this, enemyCastle){
        super(_this);
        // 0 - readyToGoToEnemyCastle
        // 1 - canAttackEnemy
        // 2 - canAttackEnemyCastle
        this.actionType = 0;
        this.enemyCastle = enemyCastle;
    }
    goToCastle() {
        this.updatePath(this.enemyCastle, this.robot.getVisibleRobotMap());
        return this.step();
    }
    checkEnemies(){
        let enemies = [];
        this.getVisibleRobotMap
    }
    do_someth(){
        switch(this.actionType){
            case 0:
                return this.goToCastle();
            case 1:

            case 2:
        }
        return;
    }
}