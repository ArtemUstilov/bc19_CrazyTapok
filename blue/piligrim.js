import WalkingRobot from 'walkingRobot.js';

export default class Piligrim extends WalkingRobot {
    constructor(_this) {
        super(_this);
        this.actionType = 0;
        this.miningCors = undefined;
        this.KARBCAPACITY = 20;
        this.FUELCAPACITY = 100;
        this.recieveMessage()
        // 0-goMine, 1-readyToMine, 2-goHome, 3-readyToGive
    }
    recieveMessage() {
        let castle = this.robot.getRobot(this.robot.getVisibleRobotMap()[this.home.y][this.home.x]);
        let index = castle.signal;
        this.miningCors = this.miningCode[index];
    }
    isFull() {
        return this.robot.me.fuel >= this.FUELCAPACITY ||
            this.robot.me.karbonite >= this.KARBCAPACITY;
    }
    goMine() {
        let point = this.miningCors;
        this.updatePath(point, this.robot.getVisibleRobotMap());
        return this.step();
    }
    goHome() {
        let home = this.findFreePlace(this.home)[0];
        if (!home) return;
        this.updatePath(home, this.robot.getVisibleRobotMap());
        return this.step();
    }
    giveRes() {
        return this.robot.give(...this.position.deltaArray(this.home), this.robot.me.karbonite, this.robot.me.fuel);
    }
    mine(){
        return this.robot.mine();
    }
    homeIsDestroyed(){
        return this.robot.getVisibleRobotMap()[this.home.y][this.home.x] > 0;
    }
    updateAction(){
        if(this.homeIsDestroyed()){
            this.actionType = -1;
        }
        if(this.isFull()){
            if (this.position.distanceSq(this.home) <= 2) {
                this.actionType = 3;
            }else{
                this.actionType = 2;
            }
        }else{
            if(this.position.equal(this.miningCors)){
                this.actionType = 1;
            }else{
                this.actionType = 0;
            }
        }
    }
    do_someth(){
        super.do_someth();
        this.updateAction();
        switch (this.actionType) {
            case 0:
                return this.goMine();
            case 1:
                return this.mine();
            case 2:
                return this.goHome();
            case 3:
                return this.giveRes();
        }

    }
}