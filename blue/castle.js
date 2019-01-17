import Creature from "./creature.js";
import Point from './point.js';
import findClosestResource from './mapScan.js';

export default class Castle extends Creature {

    constructor(_this) {
        super(_this);
        this.ignoreList = [];
        this.resMap = this.robot.karbonite_map;
        this.makeResMap();
        this.closestResource;
    }

    do_someth(ign) {
        
    }
    findNewClosest(){
        let closest =findClosestResource(this.robot.me.x, this.robot.me.y, this.resMap, this.ignoreList);
        this.closestResource = new Point(...Object.values(closest));
        this.ignoreList.push(closest);
    }
    makeResMap() {
        for (let i = 0; i < this.robot.fuel_map.length; i++) {
            for (let j = 0; j < this.robot.fuel_map.length; j++) {
                if (this.robot.fuel_map[i][j]) {
                    this.resMap[i][j] = true;
                }
            }
        }

    }
}