//waveAlgorithm finds path from A to B
//resource to read about
//https://habr.com/ru/post/264189/
export default waveAlgorithm;
function waveAlgorithm(map, pos, dest, impassabls=[], log){
    //init map where in every cell its path from pos
    //if its unpassable cell value is -1
    if(pos.distanceSq(dest) < 2)
        return [dest];
    let mapSheme = new Array(map.length)
            .fill([])
            .map(()=>new Array(map.length))
            .map(c=>c.fill(0))
            .map((row,x)=>row
                .map((c,y)=>map[x][y] ? 0 : -1))
    impassabls.forEach(p=>mapSheme[p.y][p.x] = -1);
    mapSheme[pos.y][pos.x] = 0;
    mapSheme[dest.y][dest.x] = 0;
    //wave its all cells whose neighbors need to be incremented
    let wave = [pos];
    //loop that increments all cells until we come to pos from dest
    let counter = 0;
    while(!mapSheme[dest.y][dest.x] && counter < 150){
        wave = incrementNeighbors(mapSheme, map, wave, pos);
        counter++;
    }
    if(counter == 150)
        return waveAlgorithm(map, pos, dest);
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
    let value = mapSheme[wave[0].y][wave[0].x] + 1;
    wave.forEach(waveI=>{
        getNearbyCells(
            waveI, (x)=>
                x.insideSquare(map.length)&& map[x.y][x.x]&& !mapSheme[x.y][x.x]&& !x.equal(pos)
        ).forEach(n=>{
            mapSheme[n.y][n.x] = value;
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
        .find((cell)=>mapSheme[cell.y][cell.x] == mapSheme[lastStep.y][lastStep.x] - 1)
}
