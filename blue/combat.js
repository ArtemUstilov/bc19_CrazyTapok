import WalkingRobot from "./walkingRobot.js";
import Point from "./point.js";

export class Combat extends WalkingRobot {
    constructor(_this){
        super(_this);
        this.attackRange = 0;
        this.enemyCastle = this.enemyCastleLocation();
    }
    enemyCastleLocation() {
        let point;
        if(this.X_Mirror)
            point =  new Point(this.home.x, this.width-1-this.home.y);
        else
            point = new Point(this.width-1-this.home.x, this.home.y);
        if(!point)
            throw new Error('CANT FIND ENEMIES CASTLE!!!')
        return point;
    }
    do_someth(){
        super.do_someth();
    }

}