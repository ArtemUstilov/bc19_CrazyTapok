 function scanMap(fuel_map)
    // true - по горизонтали, false - по вертикали 
    {
        let count = 0;
        for(let i = 0; i<fuel_map.length;i++)
        {
            for(let j = 0; j<fuel_map.length;j++)
                {
                    if(j==(fuel_map.length/2))break;
                    if(fuel_map[i][j]&&!fuel_map[i][fuel_map.length-1-j])return true;
                }
        }
        return false;
    }
function enemyTowerLocation(myTowerX,myTowerY,fuel_map)
{
    if(scanMap(fuel_map)) return {x:myTowerX, y:fuel_map.length-1-myTowerY};
    return {x:fuel_map.length-1-myTowerX, y:myTowerY};
}

function findClosestFuel(myTowerX, myTowerY, fuel_map, ignore)
{
    let map = fuel_map;
}

function findClosestResource(myTowerX, myTowerY, resMap, ignore)
{
    let resources =[];
     let lengths =[];
   let map = resMap;
    if(ignore.length)
        {
             
             ignore.forEach((el)=>{map[el.x][el.y]=false});     
                
        }
           for(let i = 0; i<map.length;i++)
        {
            for(let j = 0; j<map.length;j++)
                {
                    if(map[i][j])
                        {
                            resources.push({x:j,y:i});
                            lengths.push(Math.sqrt(((i-myTowerY)*(i-myTowerY))+((j-myTowerX)*(j-myTowerX))));
                        
                }
        }
   
}
   
  return resources[lengths.indexOf( Array.min(lengths))];
}
Array.min = function( array ){
    return Math.min.apply( Math, array );
};
                                         

export default findClosestResource;