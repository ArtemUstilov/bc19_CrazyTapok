import {BCAbstractRobot, SPECS} from 'battlecode';
import {Combat as Crusader, Combat as Preacher, Combat as Prophet} from './combat.js'
import Piligrim from './piligrim.js'
let step = -1;

class MyRobot extends BCAbstractRobot {
    constructor(){
        super();
    }
    my_constructor(){
          switch (this.me.unit) {
            case SPECS.PILGRIM:
                this.unit = new Piligrim(this);
                break;
            case SPECS.CRUSADER:
                this.unit = new Crusader(this);
                break;
            case SPECS.PREACHER:
                this.unit = new Preacher(this);
                break;
            case SPECS.PROPHET:
                this.unit = new Prophet(this);
                break;
              default:
                  this.unit = new Crusader(this);
        }
    }
    turn(){
        step++;
        if(!step)
           this.my_constructor();
        if(this.me.unit == SPECS.CASTLE && !step)
            return this.buildUnit(SPECS.PILGRIM, 1, 0);
        else {
            return this.unit.do_someth();
        }
    }
}
