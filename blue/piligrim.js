import Point from './point.js';
import findClosestResource from './mapScan.js';
import WalkingRobot from 'walkingRobot.js';

export default class Piligrim extends WalkingRobot{
    constructor(_this) {
        super(_this);
        this.readyToMine = false;
    }
    removePath() {
        this.currentPath = [];
        this.destination = undefined;
        this.isGoing = false;
        this.readyToMine = true;
    }
    goMine(ignore) {
        let point = new Point(...Object.values(findClosestResource(this.me.x, this.me.y, this.fuel_map, [])));
        this.updatePath(point);
    }
    do_someth(ign) {
        this.updatePosition();
        if(!this.isGoing && !this.readyToMine)this.goMine(ign);
        if (this.readyToMine) {
            return this.mine()
        } else if (this.isGoing) {
            return this.step();
        }
    }
}