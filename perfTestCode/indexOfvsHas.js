let arr = ['a','b','c','d','e','f','g','h']
let arrBad = ['a','g','h']

let map = new Map([
    ['a','g','h']
])

for ( let j =0 ; j< 100; j++) {
    console.time('indexTime')
    for (let i =0;i < arr.length; i++) {
        if(arrBad.indexOf(arr[i])) {
            let a =0;
        }
    }
    console.timeEnd('indexTime')
    
    console.time('mapTime')
    for(let i =0; i < arr.length; i++) {
        if ( map.has(arr[i])) {
            let a = 0;
        }
    }
    console.timeEnd('mapTime')
}
