//waveAlgorithm finds path from A to B
//resource to read about
//https://habr.com/ru/post/264189/
export default waveAlgorithm;
function waveAlgorithm(map, pos, dest, robotsNearby){
    let applyRobots = ()=>true;
    if(robotsNearby){
        applyRobots = (y,x)=>{
            return (robotsNearby[y][x] <= 0);
        }
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
            .map((c,y)=>!map[y][x] && applyRobots(y,x) ? -1 : 0))
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
function scaleMap(map, pos, dest){
    let size = Math.min(...pos.deltaArray(dest));
    //map = map.map(row=>row.splice(0, pos.y))
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
            })
    })
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
