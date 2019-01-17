import Creature from "./creature.js";
import Point from './point.js';
import findClosestResource from './mapScan.js';

export default class Castle extends Creature {

    constructor(_this) {
        super(_this);
        this.ignoreList = [];
        this.resMap = [];
        this.closestResource = undefined;
        this.makeResMap();
    }

    do_someth(ign) {
        
    }
    findNewClosest(){
        this.closestResource = findClosestResource();
        this.ignoreList.push(this.closestResource);
    }
    findClosestResource() {
        let resources =[];
        let lengths =[];
        if(this.ignoreList.length) {
            this.ignoreList.forEach((el)=>{this.resMap[el.x][el.y]=false});
        }
        for(let i = 0; i<this.width;i++) {
            for(let j = 0; j<this.width;j++) {
                if(this.resMap[i][j]) {
                    resources.push(new Point(j,i));
                    lengths.push(Math.sqrt(((i-this.position.x)*(i-this.position.x))
                        +((j-this.position.y)*(j-this.position.y))));
                }
            }
        }
        return resources[lengths.indexOf(Math.min(...lengths))];
    }
    makeResMap() {
        this.resMap = new Array(this.width)
            .fill([])
            .map(()=>new Array(this.width))
            .map(c=>c.fill(false));
        for (let i = 0; i < this.width; i++) {
            for (let j = 0; j < this.width; j++) {
                if (this.robot.fuel_map[i][j] || this.robot.karbonite_map[i][j]) {
                    this.resMap[i][j] = true;
                }
            }
        }
    }
}