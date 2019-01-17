 function scanMap(fuel_map){
    // true - по горизонтали, false - по вертикали
     let count = 0;
     for(let i = 0; i<fuel_map.length;i++) {
         for(let j = 0; j<fuel_map.length;j++) {
             if(j == fuel_map.length/2)
                 break;
             if(fuel_map[i][j] && !fuel_map[i][fuel_map.length-1-j])
                 return true;
         }
     }
     return false;
}
function enemyTowerLocation(myTowerX,myTowerY,fuel_map) {
    if(scanMap(fuel_map))
        return {x:myTowerX, y:fuel_map.length-1-myTowerY};
    return {x:fuel_map.length-1-myTowerX, y:myTowerY};
}