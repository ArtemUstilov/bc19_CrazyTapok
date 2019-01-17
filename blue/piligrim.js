import Point from './point.js';
import path from './distance.js';
import findClosestResource from './mapScan.js';

export default class Piligrim {
    constructor(_this) {
        this._this = _this;
        this._this.isGoing = false;
        this._this.readyToMine = false;
        this._this.destination = undefined;
    }

    updatePath(path) {
        this._this.currentPath = path;
        this._this.destination = path[path.length - 1];
        this._this.isGoing = true;
    }

    removePath() {
        this._this.currentPath = [];
        this._this.destination = undefined;
        this._this.isGoing = false;
        this._this.readyToMine = true;
    }
    goMine(mapRes, ignore) {
        this._this.updatePath(path(this._this.map, this._this.position, new Point(...Object.values(findClosestResource(this._this.me.x, this._this.me.y, mapRes, ignore)))));
    }
    step() {
        let nextPoint;
        let possiblePoints = [];
        while (this._this.currentPath.length && this._this.position.distanceSq(this._this.currentPath[0]) <= this._this.speed) {
            possiblePoints.push(this._this.currentPath.shift());
        }
        for (let i = possiblePoints.length - 1; i >= 0; i--) {
            if (!this._this.getVisibleRobotMap()[possiblePoints[i].y][possiblePoints[i].x]) {
                nextPoint = possiblePoints[i];
                for (let j = possiblePoints.length - 1; j >= i + 1; j--) {
                    this._this.currentPath.unshift(possiblePoints[j]);
                }
                break;
            }
        }
        if (!this._this.currentPath.length)
            this._this.removePath();
        if (!nextPoint)
            return;
        return this._this.move(...this._this.position.deltaArray(nextPoint))
    }
    do_someth(map, ign) {
        this.goMine(map, ign);
        if (this.isGoing) {
            return this._this.step();
        }
        else if (this._this.readyToMine) {
            this._this.log("ewqeq");
            return this._this.mine();
        }
        ;
    }
}