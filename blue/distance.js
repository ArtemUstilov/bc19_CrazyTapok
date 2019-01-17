//waveAlgorithm finds path from A to B
//resource to read about
//https://habr.com/ru/post/264189/
export default waveAlgorithm;
function waveAlgorithm(map, pos, dest){
    //init map where in every cell its path from pos
    //if its unpassable cell value is -1
    if(pos.distanceSq(dest) < 2)
        return [dest];
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
    for(let i = 0; i < wave.length; i++){
        let neighbors = getNearbyCells(
            wave[i], (x)=>
                x.insideSquare(map.length)&& map[x.y][x.x]&& !mapSheme[x.x][x.y]&& !x.equal(pos)
        )
        for(let j = 0; j < neighbors.length; j++){
            mapSheme[neighbors[j].x][neighbors[j].y] = value;
            nextWave.push(neighbors[j]);
        }
    }
    return nextWave;
}
function getNearbyCells(p,validCB){
    //gets nearby cells
    let t = [p.shift(-1,0), p.shift(1,0), p.shift(0, -1), p.shift(0,1)]
        .filter(x=>validCB(x));
    return t;
}
function decrementedCell(mapSheme, lastStep) {
    //finds cell that has n-1 value to find all path to pos
    let t = getNearbyCells(lastStep, (x)=>x.insideSquare(mapSheme.length))
    let f = t.find((cell)=>mapSheme[cell.x][cell.y] == mapSheme[lastStep.x][lastStep.y] - 1)
    return f;
}
