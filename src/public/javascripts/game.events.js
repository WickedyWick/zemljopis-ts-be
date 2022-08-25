
import { btnClickHandler, load, wordSuggest, disablePButtonByCat } from './game.functions.js'

document.getElementById('btnReady').addEventListener('click', () => {
    btnClickHandler()
})

let btns = document.getElementsByClassName('myBtn')
for ( let i = 0 ; i < btns.length ; i++ ) {
    const category = Number(btns[i].id.split('_')[1])
    btns[i].disabled = true
    btns[i].addEventListener('click', () => { wordSuggest(category) })
}

window.onload = (e) => {
    const {username, roomCode} = Qs.parse(location.search,{
        ignoreQueryPrefix: true
    })
    const sessionToken =  localStorage.getItem('sessionToken')
    load(username, roomCode, sessionToken)
     
}
