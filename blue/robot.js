import {BCAbstractRobot, SPECS} from 'battlecode';
import {Combat as Preacher, Combat as Prophet} from './combat.js'
import Piligrim from './piligrim.js';
import Castle from './castle.js';
import Crusader from './crusader.js'

let step = -1;

class MyRobot extends BCAbstractRobot {
    constructor() {
        super();
    }

    my_constructor() {
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
            case SPECS.CASTLE:
                this.unit = new Castle(this);
                break;
            //default:
                //this.unit = new Crusader(this);
        }
    }

    turn() {
        step++;
        if (!step)
            this.my_constructor();
        if (this.me.unit == SPECS.CASTLE && !step)
            return this.unit.do_someth();
        else {
            return this.unit.do_someth();
        }
    }
}
