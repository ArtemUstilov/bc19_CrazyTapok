'use strict';

var SPECS = {"COMMUNICATION_BITS":16,"CASTLE_TALK_BITS":8,"MAX_ROUNDS":1000,"TRICKLE_FUEL":25,"INITIAL_KARBONITE":100,"INITIAL_FUEL":500,"MINE_FUEL_COST":1,"KARBONITE_YIELD":2,"FUEL_YIELD":10,"MAX_TRADE":1024,"MAX_BOARD_SIZE":64,"MAX_ID":4096,"CASTLE":0,"CHURCH":1,"PILGRIM":2,"CRUSADER":3,"PROPHET":4,"PREACHER":5,"RED":0,"BLUE":1,"CHESS_INITIAL":100,"CHESS_EXTRA":20,"TURN_MAX_TIME":200,"MAX_MEMORY":50000000,"UNITS":[{"CONSTRUCTION_KARBONITE":null,"CONSTRUCTION_FUEL":null,"KARBONITE_CAPACITY":null,"FUEL_CAPACITY":null,"SPEED":0,"FUEL_PER_MOVE":null,"STARTING_HP":200,"VISION_RADIUS":100,"ATTACK_DAMAGE":10,"ATTACK_RADIUS":[1,64],"ATTACK_FUEL_COST":10,"DAMAGE_SPREAD":0},{"CONSTRUCTION_KARBONITE":50,"CONSTRUCTION_FUEL":200,"KARBONITE_CAPACITY":null,"FUEL_CAPACITY":null,"SPEED":0,"FUEL_PER_MOVE":null,"STARTING_HP":100,"VISION_RADIUS":100,"ATTACK_DAMAGE":0,"ATTACK_RADIUS":0,"ATTACK_FUEL_COST":0,"DAMAGE_SPREAD":0},{"CONSTRUCTION_KARBONITE":10,"CONSTRUCTION_FUEL":50,"KARBONITE_CAPACITY":20,"FUEL_CAPACITY":100,"SPEED":4,"FUEL_PER_MOVE":1,"STARTING_HP":10,"VISION_RADIUS":100,"ATTACK_DAMAGE":null,"ATTACK_RADIUS":null,"ATTACK_FUEL_COST":null,"DAMAGE_SPREAD":null},{"CONSTRUCTION_KARBONITE":15,"CONSTRUCTION_FUEL":50,"KARBONITE_CAPACITY":20,"FUEL_CAPACITY":100,"SPEED":9,"FUEL_PER_MOVE":1,"STARTING_HP":40,"VISION_RADIUS":49,"ATTACK_DAMAGE":10,"ATTACK_RADIUS":[1,16],"ATTACK_FUEL_COST":10,"DAMAGE_SPREAD":0},{"CONSTRUCTION_KARBONITE":25,"CONSTRUCTION_FUEL":50,"KARBONITE_CAPACITY":20,"FUEL_CAPACITY":100,"SPEED":4,"FUEL_PER_MOVE":2,"STARTING_HP":20,"VISION_RADIUS":64,"ATTACK_DAMAGE":10,"ATTACK_RADIUS":[16,64],"ATTACK_FUEL_COST":25,"DAMAGE_SPREAD":0},{"CONSTRUCTION_KARBONITE":30,"CONSTRUCTION_FUEL":50,"KARBONITE_CAPACITY":20,"FUEL_CAPACITY":100,"SPEED":4,"FUEL_PER_MOVE":3,"STARTING_HP":60,"VISION_RADIUS":16,"ATTACK_DAMAGE":20,"ATTACK_RADIUS":[1,16],"ATTACK_FUEL_COST":15,"DAMAGE_SPREAD":3}]};

function insulate(content) {
    return JSON.parse(JSON.stringify(content));
}

class BCAbstractRobot {
    constructor() {
        this._bc_reset_state();
    }

    // Hook called by runtime, sets state and calls turn.
    _do_turn(game_state) {
        this._bc_game_state = game_state;
        this.id = game_state.id;
        this.karbonite = game_state.karbonite;
        this.fuel = game_state.fuel;
        this.last_offer = game_state.last_offer;

        this.me = this.getRobot(this.id);

        if (this.me.turn === 1) {
            this.map = game_state.map;
            this.karbonite_map = game_state.karbonite_map;
            this.fuel_map = game_state.fuel_map;
        }

        try {
            var t = this.turn();
        } catch (e) {
            t = this._bc_error_action(e);
        }

        if (!t) t = this._bc_null_action();

        t.signal = this._bc_signal;
        t.signal_radius = this._bc_signal_radius;
        t.logs = this._bc_logs;
        t.castle_talk = this._bc_castle_talk;

        this._bc_reset_state();

        return t;
    }

    _bc_reset_state() {
        // Internal robot state representation
        this._bc_logs = [];
        this._bc_signal = 0;
        this._bc_signal_radius = 0;
        this._bc_game_state = null;
        this._bc_castle_talk = 0;
        this.me = null;
        this.id = null;
        this.fuel = null;
        this.karbonite = null;
        this.last_offer = null;
    }

    // Action template
    _bc_null_action() {
        return {
            'signal': this._bc_signal,
            'signal_radius': this._bc_signal_radius,
            'logs': this._bc_logs,
            'castle_talk': this._bc_castle_talk
        };
    }

    _bc_error_action(e) {
        var a = this._bc_null_action();
        
        if (e.stack) a.error = e.stack;
        else a.error = e.toString();

        return a;
    }

    _bc_action(action, properties) {
        var a = this._bc_null_action();
        if (properties) for (var key in properties) { a[key] = properties[key]; }
        a['action'] = action;
        return a;
    }

    _bc_check_on_map(x, y) {
        return x >= 0 && x < this._bc_game_state.shadow[0].length && y >= 0 && y < this._bc_game_state.shadow.length;
    }
    
    log(message) {
        this._bc_logs.push(JSON.stringify(message));
    }

    // Set signal value.
    signal(value, radius) {
        // Check if enough fuel to signal, and that valid value.

        if (this.fuel < Math.ceil(Math.sqrt(radius))) throw "Not enough fuel to signal given radius.";
        if (!Number.isInteger(value) || value < 0 || value >= Math.pow(2,SPECS.COMMUNICATION_BITS)) throw "Invalid signal, must be int within bit range.";
        if (radius > 2*Math.pow(SPECS.MAX_BOARD_SIZE-1,2)) throw "Signal radius is too big.";

        this._bc_signal = value;
        this._bc_signal_radius = radius;

        this.fuel -= radius;
    }

    // Set castle talk value.
    castleTalk(value) {
        // Check if enough fuel to signal, and that valid value.

        if (!Number.isInteger(value) || value < 0 || value >= Math.pow(2,SPECS.CASTLE_TALK_BITS)) throw "Invalid castle talk, must be between 0 and 2^8.";

        this._bc_castle_talk = value;
    }

    proposeTrade(karbonite, fuel) {
        if (this.me.unit !== SPECS.CASTLE) throw "Only castles can trade.";
        if (!Number.isInteger(karbonite) || !Number.isInteger(fuel)) throw "Must propose integer valued trade."
        if (Math.abs(karbonite) >= SPECS.MAX_TRADE || Math.abs(fuel) >= SPECS.MAX_TRADE) throw "Cannot trade over " + SPECS.MAX_TRADE + " in a given turn.";

        return this._bc_action('trade', {
            trade_fuel: fuel,
            trade_karbonite: karbonite
        });
    }

    buildUnit(unit, dx, dy) {
        if (this.me.unit !== SPECS.PILGRIM && this.me.unit !== SPECS.CASTLE && this.me.unit !== SPECS.CHURCH) throw "This unit type cannot build.";
        if (this.me.unit === SPECS.PILGRIM && unit !== SPECS.CHURCH) throw "Pilgrims can only build churches.";
        if (this.me.unit !== SPECS.PILGRIM && unit === SPECS.CHURCH) throw "Only pilgrims can build churches.";
        
        if (!Number.isInteger(dx) || !Number.isInteger(dx) || dx < -1 || dy < -1 || dx > 1 || dy > 1) throw "Can only build in adjacent squares.";
        if (!this._bc_check_on_map(this.me.x+dx,this.me.y+dy)) throw "Can't build units off of map.";
        if (this._bc_game_state.shadow[this.me.y+dy][this.me.x+dx] > 0) throw "Cannot build on occupied tile.";
        if (!this.map[this.me.y+dy][this.me.x+dx]) throw "Cannot build onto impassable terrain.";
        if (this.karbonite < SPECS.UNITS[unit].CONSTRUCTION_KARBONITE || this.fuel < SPECS.UNITS[unit].CONSTRUCTION_FUEL) throw "Cannot afford to build specified unit.";

        return this._bc_action('build', {
            dx: dx, dy: dy,
            build_unit: unit
        });
    }

    move(dx, dy) {
        if (this.me.unit === SPECS.CASTLE || this.me.unit === SPECS.CHURCH) throw "Churches and Castles cannot move.";
        if (!this._bc_check_on_map(this.me.x+dx,this.me.y+dy)) throw "Can't move off of map.";
        if (this._bc_game_state.shadow[this.me.y+dy][this.me.x+dx] === -1) throw "Cannot move outside of vision range.";
        if (this._bc_game_state.shadow[this.me.y+dy][this.me.x+dx] !== 0) throw "Cannot move onto occupied tile.";
        if (!this.map[this.me.y+dy][this.me.x+dx]) throw "Cannot move onto impassable terrain.";

        var r = Math.pow(dx,2) + Math.pow(dy,2);  // Squared radius
        if (r > SPECS.UNITS[this.me.unit]['SPEED']) throw "Slow down, cowboy.  Tried to move faster than unit can.";
        if (this.fuel < r*SPECS.UNITS[this.me.unit]['FUEL_PER_MOVE']) throw "Not enough fuel to move at given speed.";

        return this._bc_action('move', {
            dx: dx, dy: dy
        });
    }

    mine() {
        if (this.me.unit !== SPECS.PILGRIM) throw "Only Pilgrims can mine.";
        if (this.fuel < SPECS.MINE_FUEL_COST) throw "Not enough fuel to mine.";
        
        if (this.karbonite_map[this.me.y][this.me.x]) {
            if (this.me.karbonite >= SPECS.UNITS[SPECS.PILGRIM].KARBONITE_CAPACITY) throw "Cannot mine, as at karbonite capacity.";
        } else if (this.fuel_map[this.me.y][this.me.x]) {
            if (this.me.fuel >= SPECS.UNITS[SPECS.PILGRIM].FUEL_CAPACITY) throw "Cannot mine, as at fuel capacity.";
        } else throw "Cannot mine square without fuel or karbonite.";

        return this._bc_action('mine');
    }

    give(dx, dy, karbonite, fuel) {
        if (dx > 1 || dx < -1 || dy > 1 || dy < -1 || (dx === 0 && dy === 0)) throw "Can only give to adjacent squares.";
        if (!this._bc_check_on_map(this.me.x+dx,this.me.y+dy)) throw "Can't give off of map.";
        if (this._bc_game_state.shadow[this.me.y+dy][this.me.x+dx] <= 0) throw "Cannot give to empty square.";
        if (karbonite < 0 || fuel < 0 || this.me.karbonite < karbonite || this.me.fuel < fuel) throw "Do not have specified amount to give.";

        return this._bc_action('give', {
            dx:dx, dy:dy,
            give_karbonite:karbonite,
            give_fuel:fuel
        });
    }

    attack(dx, dy) {
        if (this.me.unit === SPECS.CHURCH) throw "Churches cannot attack.";
        if (this.fuel < SPECS.UNITS[this.me.unit].ATTACK_FUEL_COST) throw "Not enough fuel to attack.";
        if (!this._bc_check_on_map(this.me.x+dx,this.me.y+dy)) throw "Can't attack off of map.";
        if (this._bc_game_state.shadow[this.me.y+dy][this.me.x+dx] === -1) throw "Cannot attack outside of vision range.";

        var r = Math.pow(dx,2) + Math.pow(dy,2);
        if (r > SPECS.UNITS[this.me.unit]['ATTACK_RADIUS'][1] || r < SPECS.UNITS[this.me.unit]['ATTACK_RADIUS'][0]) throw "Cannot attack outside of attack range.";

        return this._bc_action('attack', {
            dx:dx, dy:dy
        });
        
    }


    // Get robot of a given ID
    getRobot(id) {
        if (id <= 0) return null;
        for (var i=0; i<this._bc_game_state.visible.length; i++) {
            if (this._bc_game_state.visible[i].id === id) {
                return insulate(this._bc_game_state.visible[i]);
            }
        } return null;
    }

    // Check if a given robot is visible.
    isVisible(robot) {
        return ('unit' in robot);
    }

    // Check if a given robot is sending you radio.
    isRadioing(robot) {
        return robot.signal >= 0;
    }

    // Get map of visible robot IDs.
    getVisibleRobotMap() {
        return this._bc_game_state.shadow;
    }

    // Get boolean map of passable terrain.
    getPassableMap() {
        return this.map;
    }

    // Get boolean map of karbonite points.
    getKarboniteMap() {
        return this.karbonite_map;
    }

    // Get boolean map of impassable terrain.
    getFuelMap() {
        return this.fuel_map;
    }

    // Get a list of robots visible to you.
    getVisibleRobots() {
        return this._bc_game_state.visible;
    }

    turn() {
        return null;
    }
}

//waveAlgorithm finds path from A to B
function waveAlgorithm(map, pos, dest, robotsNearby){
    let applyRobots = (y,x)=>true;
    if(robotsNearby){
        applyRobots = (y,x)=>robotsNearby[y][x] <= 0;
    }
    //init map where in every cell its path from pos
    //if its unpassable cell value is -1
    if(pos.distanceSq(dest) < 2)
        return [dest];
    let mapSheme = new Array(map.length)
        .fill([])
        .map(()=>new Array(map.length))
        .map(c=>c.fill(0))
        .map((row,x)=>row
            .map((c,y)=>!map[y][x] && applyRobots(y,x) ? -1 : 0));
    //wave its all cells whose neighbors need to be incremented
    let wave = [pos];
    //loop that increments all cells until we come to pos from dest
    while(!mapSheme[dest.x][dest.y]){
        wave = incrementNeighbors(mapSheme, map, wave, pos);
    }
    let lastStep = dest;
    let path = [];
    while(!lastStep.equal(pos)){
        path.unshift(lastStep);
        lastStep = decrementedCell(mapSheme, lastStep);
    }
    //path it is array of points
    return path;
}

function incrementNeighbors(mapSheme, map, wave, pos){
    //icnrement all nearby to wave cells
    let nextWave = [];
    if(!wave || !wave.length)return;
    let value = mapSheme[wave[0].x][wave[0].y] + 1;
    wave.forEach(waveI=>{
        getNearbyCells(
            waveI, (x)=>
                x.insideSquare(map.length)&& map[x.y][x.x]&& !mapSheme[x.x][x.y]&& !x.equal(pos)
        ).forEach(n=>{
            mapSheme[n.x][n.y] = value;
            nextWave.push(n);
            });
    });
    return nextWave;
}
function getNearbyCells(p,validCB){
    //gets nearby cells
    return [p.shift(-1,0), p.shift(1,0), p.shift(0, -1), p.shift(0,1)]
        .filter(x=>validCB(x));
}
function decrementedCell(mapSheme, lastStep) {
    //finds cell that has n-1 value to find all path to pos
    return getNearbyCells(lastStep, (x)=>x.insideSquare(mapSheme.length))
        .find((cell)=>mapSheme[cell.x][cell.y] == mapSheme[lastStep.x][lastStep.y] - 1)
}

//class to point

class Point {
    constructor(x,y){
        this.x = x;
        this.y = y;
    }
    equal(p){
        //equality
        return p.x == this.x && p.y == this.y;
    }
    covertToArray(){
        //to array
        return [this.x, this.y];
    }
    shift(dx,dy){
        //returns new moved point
        return new Point(this.x+dx, this.y+dy);
    }
    insideSquare(size){
        //is this point within square
        return this.x >= 0 && this.y >= 0 && this.x < size && this.y < size;
    }
    distanceSq(p){
        //distance from a to b
        return Math.pow(p.x-this.x, 2) + Math.pow(p.y - this.y, 2);
    }
    fastestPathLength(p, map, robots){
        return waveAlgorithm(map, this, p, robots).length;
    }
    deltaArray(p){
        //shift from a to b
        return [p.x-this.x, p.y-this.y];
    }
    toString(){
        return `Point [${this.x}, ${this.y}]`.toString();
    }
}

class Creature {
    constructor(_this){
        this.robot = _this;
        this.log = _this.log.bind(_this);
        this.castles = [];
        this.position;
        this.width = this.robot.map.length;
        this.home;
        this.updatePosition();
        this.X_Mirror = this.scanMap();
        this.miningCode = [];
        this.resMap = undefined;
        this.enemiesNearBy = [];
        this.attackRange;
        this.makeResMap();
        this.indexingMining();
    }
    inRange(dist){
        return dist <= this.attackRange
    }
    checkEnemies(){
        this.enemiesNearBy = this.robot.getVisibleRobots()
            .filter(r=>r.team != this.robot.me.team)
            .filter(r=>r.unit != SPECS.CASTLE)
            .map(r=>new Point(r.x,r.y))
            .filter(p=>this.inRange(p.distanceSq(this.position)));
    }
    weakestEnemy(){
        return this.enemiesNearBy.reduce((weakest, current)=>
            !weakest ?
                current : current.health < weakest.health ? current : weakest)
    }
    attack(aim){
        return this.robot.attack(...this.position.deltaArray(aim));
    }
    updatePosition(){
        this.position = new Point(this.robot.me.x, this.robot.me.y);
    }
    findFreePlace(dest, range = 1) {
        range = Math.floor(range);
        let freeP = [];
        let x = dest ? dest.x : this.position.x;
        let y = dest ? dest.y : this.position.y;
        this.robot.getVisibleRobotMap()
            .map((c,i)=>{return {c,i}})
            .filter(ob=>ob.i>=y-range && ob.i <= y + range)
            .forEach((row)=>row.c
                .map((obt,j)=>{return {c:obt,i:row.i,j}})
                .filter(o=>o.j>=x-range && o.j <= x + range)
                .filter(ob=>ob.c <= 0 && this.robot.map[ob.i][ob.j])
                .map(ob=>new Point(ob.j,ob.i))
                .filter(p=>range == 1 || range*range >= p.distanceSq(new Point(x,y)))
                .forEach(p=>freeP.push(p)));

        if (freeP.length < 1)
            this.log("WOOOOOOOOOOOOW CANT FIND FREE SPACE, GEY");
        return freeP;
    }
    scanMap(){
        // true - по горизонтали, false - по вертикали
        for(let i = 0; i<this.width;i++) {
            for(let j = 0; j<this.width;j++) {
                if(j == this.width/2)
                    break;
                if(this.robot.fuel_map[i][j] && !this.robot.fuel_map[i][this.width-1-j])
                    return true;
            }
        }
        return false;
    }
    makeResMap() {
        this.resMap = new Array(this.width)
            .fill([])
            .map(() => new Array(this.width))
            .map(c => c.fill(false));
        let fx = 0, fy = 0, endx = this.width, endy = this.width;
        if (!this.X_Mirror) {
            if (this.position.x < this.width / 2)
                endx = this.width / 2;
            else
                fx = Math.floor(this.width / 2);
        } else {
            if (this.position.y < this.width / 2)
                endy = this.width / 2;
            else
                fy = Math.floor(this.width / 2);
        }
        for (let i = fy; i < endy; i++) {
            for (let j = fx; j < endx; j++) {
                if (this.robot.fuel_map[i][j] || this.robot.karbonite_map[i][j]) {
                    this.resMap[i][j] = true;
                }
            }
        }
    }
    indexingMining(){
        this.robot.map.forEach((row,y)=>row.forEach((_,x)=>{
            if(this.resMap[y][x])
                this.miningCode.push(new Point(x,y));
        }));
    }
}

class WalkingRobot extends Creature{
    constructor(_this){
        super(_this);
        this.currentPath = [];
        this.speed = this.robot.me.unit == SPECS.CRUSADER ? 9 : 4;
        this.makeHomeCordinates();
    }
    updatePath(dest, robotsMap) {
        this.currentPath = waveAlgorithm(this.robot.map, this.position, dest, robotsMap);
    }
    removePath() {
        this.currentPath = [];
    }
    makeHomeCordinates(){
        this.robot.getVisibleRobotMap()
            .filter((_,i)=>i>=this.position.y-1 && i <= this.position.y + 1)
            .forEach((row,i)=>row
                .filter((_,j)=>j>=this.position.x-1 && j <= this.position.x + 1)
                .filter(c=>c > 0)
                .map(c=>this.robot.getRobot(c))
                .filter(c=>c.unit == SPECS.CASTLE || c.unit == SPECS.CHURCH)
                .forEach(c=>this.home = new Point(c.x,c.y)));
    }
    step(){
        let nextPoint = this.currentPath
            .filter(p=>this.position.distanceSq(p)<=this.speed)
            .reverse()
            .find(p=>!this.robot.getVisibleRobotMap()[p.y][p.x]);
        let index = nextPoint && this.currentPath.findIndex(c=>c.equal(nextPoint));
        this.currentPath.splice(0, index+1);
        if(!this.currentPath.length)
            this.removePath();
        return nextPoint && this.robot.move(...this.position.deltaArray(nextPoint))
    }
    do_someth(){
        this.updatePosition();
    }
}

class Combat extends WalkingRobot {
    constructor(_this){
        super(_this);
        this.attackRange = 0;
        this.enemyCastle = this.enemyCastleLocation();
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
    do_someth(){
        super.do_someth();
    }

}

class WalkingRobot$1 extends Creature{
    constructor(_this){
        super(_this);
        this.currentPath = [];
        this.speed = this.robot.me.unit == SPECS.CRUSADER ? 9 : 4;
        this.makeHomeCordinates();
    }
    updatePath(dest, robotsMap) {
        this.currentPath = waveAlgorithm(this.robot.map, this.position, dest, robotsMap);
    }
    removePath() {
        this.currentPath = [];
    }
    makeHomeCordinates(){
        this.robot.getVisibleRobotMap()
            .filter((_,i)=>i>=this.position.y-1 && i <= this.position.y + 1)
            .forEach((row,i)=>row
                .filter((_,j)=>j>=this.position.x-1 && j <= this.position.x + 1)
                .filter(c=>c > 0)
                .map(c=>this.robot.getRobot(c))
                .filter(c=>c.unit == SPECS.CASTLE || c.unit == SPECS.CHURCH)
                .forEach(c=>this.home = new Point(c.x,c.y)));
    }
    step(){
        let nextPoint = this.currentPath
            .filter(p=>this.position.distanceSq(p)<=this.speed)
            .reverse()
            .find(p=>!this.robot.getVisibleRobotMap()[p.y][p.x]);
        let index = nextPoint && this.currentPath.findIndex(c=>c.equal(nextPoint));
        this.currentPath.splice(0, index+1);
        if(!this.currentPath.length)
            this.removePath();
        return nextPoint && this.robot.move(...this.position.deltaArray(nextPoint))
    }
    do_someth(){
        this.updatePosition();
    }
}

class Piligrim extends WalkingRobot$1 {
    constructor(_this) {
        super(_this);
        this.actionType = 0;
        this.miningCors = undefined;
        this.KARBCAPACITY = 20;
        this.FUELCAPACITY = 100;
        this.recieveMessage();
        // 0-goMine, 1-readyToMine, 2-goHome, 3-readyToGive
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
            this.actionType = -1;
            return;
        }
        if(this.isFull()){
            if (this.position.distanceSq(this.home) <= 2) {
                this.actionType = 3;
            }else{
                this.actionType = 2;
            }
        }else{
            if(this.position.equal(this.miningCors)){
                this.actionType = 1;
            }else{
                this.actionType = 0;
            }
        }
    }
    do_someth(){
        super.do_someth();
        this.updateAction();
        switch (this.actionType) {
            case 0:
                return this.goMine();
            case 1:
                return this.mine();
            case 2:
                return this.goHome();
            case 3:
                return this.giveRes();
        }

    }
}

class Castle extends Creature {
    constructor(_this) {
        super(_this);
        this.busyMines = new Set();
        this.closestResource = undefined;
        this.mapIsFull = false;
        this.currentFreePlace = undefined;
        this.checkDistantMines();
        this.actionType = 0;
        this.attackRange = 10;
        // 0 - create pilgrims, 1 - create crusaders, 2 - attack enemies
        this.step = -1;
        this.piligrims = 0;
        this.crusaders = 0;
    }
    checkDistantMines(){
        this.miningCode.forEach((m,i)=>{
            if(this.position.fastestPathLength(m, this.robot.map, this.robot.getVisibleRobotMap()) > 15)
                this.busyMines.add(i);
        });
    }
    recieveMsgs(){
        this.robot.getVisibleRobots()
            .filter(x => SPECS.CASTLE == x.unit)
            .filter(r=>r.castle_talk)
            .forEach(r => this.busyMines.add(255 - r.castle_talk));
    }
    canAfford(unit, amount = 1) {
        let data = {
            [SPECS.CRUSADER]: {f: 50, c: 20},
            [SPECS.PROPHET]: {f: 50, c: 25},
            [SPECS.PREACHER]: {f: 50, c: 30},
            [SPECS.PILGRIM]: {f: 50, c: 10},
        };
        return data[unit].f * amount <= this.robot.fuel && data[unit].c * amount <= this.robot.karbonite;
    }
    countCastles() {
        return this.robot.getVisibleRobots()
            .filter(r => r.unit == SPECS.CASTLE)
            .reduce(x => x + 1, 1);
    }
    sendResCoor() {
        let index = this.miningCode.findIndex(c=>this.closestResource.equal(c));
        this.busyMines.add(index);
        this.robot.castleTalk(255 - index);
        this.robot.signal(index, 2);
    }
    findClosestResource() {
        let resources = [], lengths = [];
        this.miningCode
            .filter((_,i)=>!this.busyMines.has(i))
            .forEach((mineCell, index) => {
                resources.push(mineCell);
                lengths.push(this.position.distanceSq(mineCell));});
        if (resources.length == 1)
            this.mapIsFull = true;
        this.closestResource = resources[lengths.indexOf(Math.min(...lengths))];
    }
    updateActions(){
        if(this.enemiesNearBy.length)
            this.actionType = 2;
        else if (this.canAfford(SPECS.PILGRIM) && !this.mapIsFull && this.step < 100)
            this.actionType = 0;
        else if(this.canAfford(SPECS.CRUSADER) && this.robot.fuel > 500)
            this.actionType = 1;
        else
            this.actionType = -1;
    }
    do_someth(ign) {
        this.step++;
        this.recieveMsgs();
        this.checkEnemies();
        this.updateActions();
        switch (this.actionType){
            case 0:
                this.findClosestResource();
                this.sendResCoor();
                this.currentFreePlace = this.position.deltaArray(this.findFreePlace()[0]);
                if(this.currentFreePlace) {
                    this.piligrims++;
                    return this.robot.buildUnit(SPECS.PILGRIM, ...this.currentFreePlace);
                }
                break;
            case 1:
                this.currentFreePlace = this.position.deltaArray(this.findFreePlace()[0]);
                if(this.currentFreePlace) {
                    this.crusaders++;
                    return this.robot.buildUnit(SPECS.CRUSADER, ...this.currentFreePlace);
                }
                break;
            case 2:
                return this.attack(this.weakestEnemy())
        }

    }
}

class Crusader extends Combat {
    constructor(_this){
        super(_this);
        // 0 - readyToGoToEnemyCastle
        // 1 - canAttackEnemy
        // 2 - canAttackEnemyCastle
        this.actionType = 0;
        this.attackRange = 16;
    }
    goToCastle() {
        let dest = this.findFreePlace(this.enemyCastle, Math.sqrt(this.attackRange)-1)[0];
        this.updatePath(dest, this.robot.getVisibleRobotMap());
        return this.step();
    }
    updateActions(){
        if(this.inRange(this.position.distanceSq(this.enemyCastle)))
            this.actionType = 2;
        else if(this.enemiesNearBy && this.enemiesNearBy.length)
            this.actionType = 1;
        else
            this.actionType = 0;
    }
    do_someth(){
        super.do_someth();
        this.checkEnemies();
        this.updateActions();
        switch(this.actionType){
            case 0:
                return this.goToCastle();
            case 1:
                return this.attack(this.weakestEnemy());
            case 2:
                return this.attack(this.enemyCastle);
        }
    }
}

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
                this.unit = new Combat(this);
                break;
            case SPECS.PROPHET:
                this.unit = new Combat(this);
                break;
            case SPECS.CASTLE:
                this.unit = new Castle(this);
                break;
        }
    }

    turn() {
        step++;
        if (!step)
            this.my_constructor();
            return this.unit.do_someth();
    }
}

var robot = new MyRobot();
