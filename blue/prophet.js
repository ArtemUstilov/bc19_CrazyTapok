import Point from "./point.js";
import {Combat} from "./combat.js";
import {SPECS} from 'battlecode'
export default class Prophet extends Combat {
    constructor(_this){
        super(_this);
        this.attackRangeMin = 16;
        this.attackRangeMax = 64;
    }
    inRange(dist){
        return dist <= this.attackRangeMax && dist >= this.attackRangeMin;
    }
    goToCastle() {
        super.goToCastle();
        let dest = this.findFreePlace(this.enemyCastle, Math.sqrt(this.attackRangeMax)-1, Math.sqrt(this.attackRangeMin))[0];
        this.updatePath(dest, this.robot.getVisibleRobotMap());
        return this.step();
    }
    do_someth(){
        super.do_someth();
    }
}