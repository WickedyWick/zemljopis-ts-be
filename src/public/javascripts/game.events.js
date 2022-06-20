
import { playerReady, load } from './game.functions.js'

document.getElementById('btnReady').addEventListener('click', () => {
    playerReady()
})

window.onload = (e) => {
    const {username, roomCode} = Qs.parse(location.search,{
        ignoreQueryPrefix: true
    })
    const sessionToken =  localStorage.getItem('sessionToken')
    load(username, roomCode, sessionToken)
}
