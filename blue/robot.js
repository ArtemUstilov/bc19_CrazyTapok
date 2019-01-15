import {BCAbstractRobot, SPECS} from 'battlecode';
import nav from './nav.js';

let step = -1;

class MyRobot extends BCAbstractRobot {
    constructor(){
        super();
        this.potField = [];
        this.width = 0;
    }
    my_constructor(){
        this.width = this.map.length;
        this.potField = new Array(this.width).fill([]).map(()=>new Array(this.width)).map(x=>x.fill(0));
        this.initField(this.potField, this.map);
        this.impulse({x:20, y:20}, Math.round(Math.sqrt(nav.sqDist(this.me, {x:20, y:20}))), -2);
        this.log(this.potField.toString());
        this.log(this.width)
    }
    initField(){
        for(let i = 0; i < this.width; i++)
            for(let j = 0; j < this.width; j++)
                if(!this.map[i][j]){
                    this.impulse({x:i, y:j}, 3);
                }
    }
    impulse(point, radius, strength = 1){
        for(let i = Math.max(point.x-radius, 0); i <= Math.min(point.x+radius, this.width-1); i++){
            for(let j = Math.max(point.y-radius, 0); j <= Math.min(point.y+radius, this.width-1); j++){
                if(this.map[i][j]){
                    let dist = Math.round(Math.sqrt(nav.sqDist(point, {x:i, y:j})));
                    if(dist < radius)
                        this.potField[i][j] -= strength * (radius - dist);
                }
            }
        }
        this.potField[point.x][point.y] = strength > 0 ? -10000 : 10000;
    }
    step(){
        let cord = {
            cor:{x:0, y:0},
            val: this.potField[this.me.x][this.me.y]
        };
        for(let i = Math.max(this.me.x-1, 0); i <= Math.min(this.me.x+1, this.width-1); i++){
            for(let j = Math.max(this.me.y-1, 0); j <= Math.min(this.me.y+1, this.width-1); j++){
                let val = this.potField[i][j];
               cord = cord.val < val ? cord : {cor:{x: i-this.me.x, y: j-this.me.y},val:val}
            }
        }
        this.log(`Cords: ${this.me.x} ${this.me.y} move ${cord.cor.x} ${cord.cor.y} and map size is ${this.width}`)
        return cord.cor;
    }
    turn(){
        step++;
        if(!step)
            this.my_constructor();
        if(this.me.unit !== SPECS.CASTLE) {
            let cords = this.step();
            return this.move(cords.x, cords.y);
        }
        else if(!step)
            return this.buildUnit(SPECS.CRUSADER, 1, 0);
    }
}
