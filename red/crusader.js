import Point from "./point.js";
import {Combat} from "./combat.js";
import {SPECS} from 'battlecode'
export default class Crusader extends Combat {
    constructor(_this){
        super(_this);
        this.attackRange = 16;
    }
    goToCastle() {
        let dest = this.findFreePlace(this.enemyCastle, Math.sqrt(this.attackRange)-1)[0];
        this.updatePath(dest, this.robot.getVisibleRobotMap());
        return this.step();
    }
    do_someth(){
        return super.do_someth();
    }
}