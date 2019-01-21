import WalkingRobot from 'walkingRobot.js';

export default class Piligrim extends WalkingRobot {
    constructor(_this) {
        super(_this);
        this.actionType = 0;
        this.miningCors = undefined;
        this.KARBCAPACITY = 20;
        this.FUELCAPACITY = 100;
        this.recieveMessage()
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
        return this.robot.getVisibleRobotMap()[this.home.y][this.home.x] == 0;
    }
    updateAction(){
        if(this.homeIsDestroyed()){
            this.actionType = 'freeze';
            return;
        }
        if(this.isFull()){
            if (this.position.distanceSq(this.home) <= 2) {
                this.actionType = 'give';
            }else{
                this.actionType = 'goHome';
            }
        }else{
            if(this.position.equal(this.miningCors)){
                this.actionType = 'mine';
            }else{
                this.actionType = 'goHome';
            }
        }
    }
    do_someth(){
        super.do_someth();
        this.updateAction();
        switch (this.actionType) {
            case 'goMine':
                return this.goMine();
            case 'mine':
                return this.mine();
            case 'goHome':
                return this.goHome();
            case 'give':
                return this.giveRes();
            case 'freeze':
                return;
            default:
                throw new Error('ILLEGAL ACTION TYPE')
        }

    }
}