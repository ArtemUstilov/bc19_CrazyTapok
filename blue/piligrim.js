import Point from './point.js';
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
    recieveMessage(){
        let castle = this.robot.getRobot(this.robot.getVisibleRobotMap()[this.home.y][this.home.x]);
        this.miningCors = this.parseCors(castle.signal);
        let index = -1;
        this.miningCode.forEach((c,i)=>{
            if(c.x == this.miningCors.x && c.y == this.miningCors.y)
                index = i;
        })
        if(index < 0)
            this.log('CANT FIN THIS CORS ON MAP ' + this.miningCors+ " " + this.miningCode.toString())
        this.robot.castleTalk(index);
    }
    parseCors(code){
        let y = code%100;
        let x = Math.floor(code/100);
        this.log('CORS THAT RECIEVE MINER ' + x + ' ' + y)
        return new Point(x, y);
    }
    removePath() {
        super.removePath();
        this.actionType = 1;
        if (this.isFull())
            this.actionType = 3;
    }
    isFull(endMineF = 0, endMineK = 0) {
        return this.robot.me.fuel >= this.FUELCAPACITY-endMineF ||
               this.robot.me.karbonite >= this.KARBCAPACITY-endMineK;
    }
    goMine(ignore) {
        if(this.position.equal(this.miningCors))
            return;
        let point = this.miningCors;
        this.updatePath(point, this.robot.getVisibleRobotMap());
        return this.step();
    }

    goHome() {
        if (this.position.distanceSq(this.home) > 2) {
            let home = this.findFreePlace(this.home, 1);
            if(!home)return;
            this.updatePath(home[0], this.robot.getVisibleRobotMap());
        }
        return this.step();
    }
    do_someth(ign) {
        this.updatePosition();
        switch (this.actionType) {
            case 0:
                return this.goMine(ign);
            case 1:
                if (this.isFull(10,2))
                    this.actionType = 2;
                return this.robot.mine();
            case 2:
                return this.goHome();
            case 3:
                this.actionType = 0;
                return this.robot.give(...this.position.deltaArray(this.home), this.robot.me.karbonite, this.robot.me.fuel);
        }

    }
}