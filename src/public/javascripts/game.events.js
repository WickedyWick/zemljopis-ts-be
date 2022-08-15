
import { btnClickHandler, load } from './game.functions.js'

document.getElementById('btnReady').addEventListener('click', () => {
    btnClickHandler()
})

window.onload = (e) => {
    const {username, roomCode} = Qs.parse(location.search,{
        ignoreQueryPrefix: true
    })
    const sessionToken =  localStorage.getItem('sessionToken')
    load(username, roomCode, sessionToken)
}
