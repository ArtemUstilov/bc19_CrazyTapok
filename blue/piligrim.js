import Point from './point.js';
import findClosestResource from './mapScan.js';
import WalkingRobot from 'walkingRobot.js';

export default class Piligrim extends WalkingRobot {
    constructor(_this) {
        super(_this);
        this.actionType = 0;
        // 0-goMine, 1-readyToMine, 2-goHome, 3-readyToGive
    }

    removePath() {
        super.removePath();
        this.actionType = 1;
        if (this.isFull(100,100))
            this.actionType = 3;
    }

    isFull(fuelNum, karboniteNum) {
        return this.robot.me.fuel == fuelNum || this.robot.me.karbonite == karboniteNum;
    }

    goMine(ignore) {
        let point = new Point(...Object.values(findClosestResource(this.position.x, this.position.y, this.robot.fuel_map, [])));
        this.updatePath(point, this.robot.getVisibleRobotMap());
        return this.step();
    }

    goHome() {
        if (this.position.distanceSq(this.home) > 2)
            this.updatePath(this.findFreePlace(this.home)[0]);
        return this.step();
    }

    do_someth(ign) {
        this.updatePosition();

        this.log(this.actionType);
        switch (this.actionType) {
            case 0:
                return this.goMine(ign);
            case 1:
                if (this.isFull(90,100))
                    this.actionType = 2;
                return this.robot.mine();
            case 2:
                return this.goHome();
            case 3:
                this.actionType = 0;
                return this.robot.give(...this.position.deltaArray(this.home), this.robot.me.karbonite, this.robot.me.fuel);
        }
        if (!this.isGoing && !this.readyToMine) this.goMine(ign);
        if (this.readyToMine && this.robot.me.fuel < 91) {
            this.log(this.position.x)
            return this.robot.mine()
        } else if (this.isGoing) {
            return this.step();
        } else {
            this.log(this.home + "  " + this.findFreePlace(this.home).toString());
            this.updatePath(this.findFreePlace(this.home)[0]);
            return this.step();
        }
    }
}