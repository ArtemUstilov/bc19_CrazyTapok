import Point from './point.js'
//waveAlgorithm finds path from A to B
//resource to read about
//https://habr.com/ru/post/264189/
export default waveAlgorithm;
function waveAlgorithm(map, pos, dest){
    //init map where in every cell its path from pos
    //if its unpassable cell value is -1
    let mapSheme = new Array(map.length)
        .fill([])
        .map(()=>new Array(map.length))
        .map(c=>c.fill(0))
        .map((row,x)=>row
            .map((c,y)=>!map[y][x] ? -1 : 0))
    //wave its all cells whose neighbors need to be incremented
    let wave = [pos];
    //loop that increments all cells until we come to pos from dest
    while(!mapSheme[dest.x][dest.y]){
        wave = incrementNeighbors(mapSheme, map, wave, pos);
    }
    //restore the path
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
    wave.forEach(p=>{
        let lastValue = mapSheme[wave[0].x][wave[0].y];
        let neighbors = getNearbyCells(p, map.length)
            .filter(n => map[n.x][n.y] && !mapSheme[n.x][n.y] && !n.equal(pos))
        neighbors.forEach(n => mapSheme[n.x][n.y] = lastValue + 1)
        nextWave.push(...neighbors);
    })
    //returns all this neighbors as next wave
    return nextWave;
}
function getNearbyCells(p, mapSize){
    //gets nearby cells thats is within the map
    let t = [[-1,0],[1,0],[0,-1],[0,1]]
        .map(t=>p.shift(t[0],t[1]))
        .filter(x=>x.insideSquare(mapSize));
    return t;
}
function decrementedCell(mapSheme, lastStep) {
    //finds cell that has n-1 value to find all path to pos
    let t = getNearbyCells(lastStep, mapSheme.length)
    let f = t.find((cell)=>mapSheme[cell.x][cell.y] == mapSheme[lastStep.x][lastStep.y] - 1)
    return f;
}
