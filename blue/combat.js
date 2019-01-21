import WalkingRobot from "./walkingRobot.js";
import Point from "./point.js";

export class Combat extends WalkingRobot {
    constructor(_this){
        super(_this);
        this.attackRange = 0;
        this.enemyCastle = this.enemyCastleLocation();
        this.behav = 0;
        this.actionType = 'freeze';
        this.recieveMessage();
        // 1 - atacker
        // 0 - defender
    }
    recieveMessage() {
        let castle = this.robot.getRobot(this.robot.getVisibleRobotMap()[this.home.y][this.home.x]);
        let msg = castle.signal;
        if(msg == 2)
            this.behav = 'attack'
        else{
            this.behav = 'def'
            this.posForDef = this.parseDefCors(msg);
        }

    }
    parseDefCors(msg){
        let y = msg%100;
        let x = Math.floor(msg/100)%100;
        return new Point(x,y);
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
    updateActionsAttack(){
        if(this.enemiesNearBy && this.enemiesNearBy.length)
            this.actionType = 'attack';
        else if(this.inRange(this.position.distanceSq(this.enemyCastle))){
            if(this.robot.getVisibleRobots()
                .find(r=>this.enemyCastle.equal(new Point(r.x,r.y)) && r.unit == SPECS.CASTLE)){
                this.actionType = 'attackCastle';
            } else{
                this.updateActionsDef();
                this.behav = 'def';
            }
        } else
            this.actionType = 'toCastle';
    }
    goToDefPos(){
        let dest = this.posForDef;
        this.updatePath(dest);
        return this.step();
    }
    updateActionsDef(){
        if(this.enemiesNearBy && this.enemiesNearBy.length)
            this.actionType = 'attack';
        else if(!this.position.equal(this.posForDef))
            this.actionType = 'toDefPos'
        else
            this.actionType = 'freeze';
    }
    do_someth(){
        super.do_someth();
        this.checkEnemies();
        if(this.behav == 'def')
            this.updateActionsDef();
        else
            this.updateActionsAttack();
        switch(this.actionType){
            case 'toCastle':
                return this.goToCastle();
            case 'attack':
                return this.attack(this.weakestEnemy());
            case 'attackCastle':
                return this.attack(this.enemyCastle);
            case 'toDefPos':
                return this.goToDefPos();
            case 'freeze':
                return;
            default:
                throw new Error('ILLEGAL ACTION TYPE')
        }
    }

}