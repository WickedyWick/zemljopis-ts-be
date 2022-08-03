
/// Conclusion, replace wins by a huge margin
let string1 = ''
let string2 = ''
function spliceTest(i, str) {
    var tmp = str.split('')
    tmp.splice(i, 1)
    return tmp.join('')
}
function replace(i, str) {
    return str.replace(str[i], '')
}
const testSample = 10000
for (let i =0; i < testSample;i++) {
    string1 += 'x'
    string2 += 'x'
}
/*
console.time('splice')
for (let i =0; i < testSample;i++) {
    spliceTest(i, string1)
}
console.timeEnd('splice')
*/
console.time('replace')
for(let i =0;i < testSample; i++) {
    replace(i, string2)
}
console.timeEnd('replace')