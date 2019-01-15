import {BCAbstractRobot, SPECS} from 'battlecode';
import nav from './nav.js';

let step = -1;

class MyRobot extends BCAbstractRobot {
    constructor(){
        super();
        this.pendingRecievedMessages = {};
        this.enemyCastles = [];
        let arr = new Array(this.map.length);
        this.potField = arr.fill(arr.fill(0));
        this.initField();
    }
    initField(){
        let genPoint = (point)=>{
             for(let i = Math.min(point.x-3, 0); i <= Math.max(point.x+3, this.map.length); i++){
                for(let i = Math.min(point.y-3, 0); i <= Math.max(point.y+3, this.map.length); i++){
                    this.potField[i][j] += Math.abs(i-point.x)+Math.abs(j-point.y);
                }
             }
        }
        for(let i = 0; i < this.map.length; i++)
            for(let j = 0; j < this.map.length; j++)
                if(!this.map[i][j]){
                    genPoint({x:i, y:j});
                    this.potField[i][j] = 100;
                }
        this.log(this.potField);
    }
    turn(){
        step++;
    }
}