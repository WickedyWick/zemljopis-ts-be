import { N_TYPE, BTN_COLORS, BTN_STATES, SessionTokenRegEx, UsernameRegEx, RoomCodeRegEx  } from './game.consts.js'
import socket , { SOCKET_EVENTS } from './game.sockets.js'
// player count label lblPlayerCount
// player ready label lblPlayersReady
// round number label roundNumber
// points label poeni
// username localPlayer
// roomCode lblRoomCode
// timer counter
// ready button btnReady
// round list roundSelect
let username = ''
let roomCode = ''
let sessionToken = ''

let playerCount = 0
let playersReady = 0
let ready = false
let gameStarted = false

let lblPlayerCount = null
let lblPlayerReady = null
let lblRoundNumber = null
let lblPoints = null
let lblRoomCode = null
let lblTimer = null
let btnReady = null
let ddlRoundSelect = null


export const load = (_username, _roomCode, _sessionToken) => {
    const usernameReg = new RegExp(UsernameRegEx, 'g').test(_username)
    const roomCodeReg = new RegExp(RoomCodeRegEx, 'g').test(_roomCode)
    const sessionTokenReg = new RegExp(SessionTokenRegEx, 'g').test(_sessionToken)
    if(usernameReg && roomCodeReg && sessionTokenReg) {
        username = _username
        roomCode = _roomCode
        sessionToken = _sessionToken
        console.log(socket)
        socket.emit(SOCKET_EVENTS.JOIN_ROOM, { username, roomCode, sessionToken })
        // initialzie fields
        lblPlayerCount = document.getElementById('lblPlayerCount')
        lblPlayerReady = document.getElementById('lblPlayersReady')
        lblRoundNumber = document.getElementById('lblRoundNumber')
        lblPoints = document.getElementById('lblPoints')
        lblRoomCode = document.getElementById('lblRoomCode')
        lblTimer = document.getElementById('lblTimer')
        btnReady = document.getElementById('btnReady')
        ddlRoundSelect = document.getElementById('roundSelect')
    } else {
        //not and send back
    }

}

// maybe this should be wrapped in class
export const joinRoomResponse = (data) => {
    /*
    CODE: 200/404
    MSG?: string (error)
    points: string
    ready: string
    0(playersReady): string
    1(playerCount): string
    2(roundNumber): string
    3(roundTimeLimit): string
    4(roundActive): string
    players: Array<string>
    */
    console.log(data)
    if(data.code == 200) {
        console.log(data)
        console.log(username, roomCode)
        $('#maxDiv').show()
        ready = data['ready'] === "1"
        console.log(ready)
        if (ready) {
            setButtonReady()
            btnReady.disabled = false
            ready = true
            notify(N_TYPE.SUCCESS, 'Spremni ste!')
        }
        playerCount = Number(data['1'])
        $('#lblPlayerCount').text(playerCount)
        playersReady= Number(data['0'])
        $('#lblPlayersReady').text(playersReady)
        $('#roundNumber').text(data['2'])
        $('#poeni').text(data['points'])
        $('#localPlayer').text(username)
        $('#lblRoomCode').append(roomCode)
        $('#counter').text(data['3'])
        sessionToken = localStorage.getItem('sessionToken')
        localStorage.setItem("roomCode",roomCode)
        localStorage.setItem("username",username)
        for( let i = 0; i < data['2']; i++) {
            $('#roundSelect').append(`<option value="${i}">
                ${i}
            </option>`)
        }
        notify(N_TYPE.SUCCESS, 'Uspesno ste se pridruzili sobi')
        if(data['4'] == '1') {
            btnReady.disabled = true
            disableAllInputFields()
            gameStarted = true;
            notify(N_TYPE.SUCCESS, 'Sačekajte sledecu rundu da bi ste nastavili da igrate!')
        }
        for( let i = 0; i < data['players'].length; i++) {
            if(data['players'][i] != username)
                $('#players').append(`<li>${data['players'][i]}</li>`)
        }
    } else {
        $('#maxDiv').hide()
        notify(N_TYPE.WARNING, 'Korisnicko ime i ili soba nisu vazeci!')
    }
}

export const playerReadyResponse = (data) => {
    /*
    username: string,
    CODE: number
    */
    if(data.CODE >= 400) {
        //alert
        setButtonUnReady()
        btnReady.disabled = false
        ready = false
        notify(N_TYPE.WARNING, 'Doslo je do problema pokusajte ponovo')
        return
    } 
    if(data.username == username) {
        setButtonReady()
        btnReady.disabled = false
        ready = true
        notify(N_TYPE.SUCCESS, 'Spremni ste!')
    }
    if(playersReady < playerCount)
        playersReady++
    $('#lblPlayersReady').text(playersReady)
    
}

export const playerUnReadyReadyResponse = (data) => {
    /*
    username: string,
    CODE: number
    */
    if(data.CODE > 400) {
        //alert
        setButtonUnReady()
        btnReady.disabled = false
        ready = false
        notify(N_TYPE.WARNING, 'Doslo je do problema pokusajte ponovo')
        return
    } 
    if(data.username == username) {
        setButtonUnReady()
        btnReady.disabled = false
        ready = false
        notify(N_TYPE.SUCCESS, 'Niste spremni')
    }
    // maybe return player count? :D
    if(playersReady > 0)
        playersReady--
    $('#lblPlayersReady').text(playersReady)
}

export const playerReady = () => {
    if(gameStarted) {
        // you will serve data here
        return
    } 
    if(!ready) {
        socket.emit('playerReady', ({ username, roomCode, sessionToken }))
        btnReady.disabled = true
        return
    }
    socket.emit('playerUnReady', ({ username, roomCode, sessionToken }))
    btnReady.disabled = true
    return
}

const notify = (type, message) => {
    // type, warning, info, success
    new Noty({  
        theme : 'metroui',
        type : type,
        layout : 'topRight',
        text : message,
        timeout : 5000,
        progressBar :true
    }).show()
}
function disableAllPButtons(){
    $("#predloziBtnDrzava").prop("disabled", true )
    $("#predloziBtnGrad").prop("disabled", true )
    $("#predloziBtnIme").prop("disabled", true )
    $("#predloziBtnBiljka").prop("disabled", true )
    $("#predloziBtnZivotinja").prop("disabled", true )
    $("#predloziBtnPlanina").prop("disabled", true )
    $("#predloziBtnReka").prop("disabled", true )
    $("#predloziBtnPredmet").prop("disabled", true )
}
function enableAllPButtons(){
    $("#predloziBtnDrzava").prop("disabled", false )
    $("#predloziBtnGrad").prop("disabled", false )
    $("#predloziBtnIme").prop("disabled", false )
    $("#predloziBtnBiljka").prop("disabled", false )
    $("#predloziBtnZivotinja").prop("disabled", false )
    $("#predloziBtnPlanina").prop("disabled", false )
    $("#predloziBtnReka").prop("disabled", false )
    $("#predloziBtnPredmet").prop("disabled", false )
}
function hideAllHelp(){
    $("#helpDrzava").hide()
    $("#helpGrad").hide()
    $("#helpPredmet").hide()
    $("#helpIme").hide()
    $("#helpBiljka").hide()
    $("#helpReka").hide()
    $("#helpPlanina").hide()
    $("#helpZivotinja").hide()
}
function clearAllInputFields(){
    $("#inputDrzava").val('')
    $("#inputGrad").val('')
    $("#inputPredmet").val('')
    $("#inputIme").val('')
    $("#inputBiljka").val('')
    $("#inputReka").val('')
    $("#inputPlanina").val('')
    $("#inputZivotinja").val('')
}
function disableAllInputFields(){
    $("#inputDrzava").prop("disabled", true )
    $("#inputGrad").prop("disabled", true )
    $("#inputPredmet").prop("disabled", true )
    $("#inputIme").prop("disabled", true )
    $("#inputBiljka").prop("disabled", true )
    $("#inputReka").prop("disabled", true )
    $("#inputPlanina").prop("disabled", true )
    $("#inputZivotinja").prop("disabled", true )

}
function enableAllInputFields(){
    $("#inputDrzava").prop("disabled", false )
    $("#inputGrad").prop("disabled", false )
    $("#inputPredmet").prop("disabled", false )
    $("#inputIme").prop("disabled", false )
    $("#inputBiljka").prop("disabled", false )
    $("#inputReka").prop("disabled", false )
    $("#inputPlanina").prop("disabled", false )
    $("#inputZivotinja").prop("disabled", false )

}

function setButtonReady() {
    btnReady.style.backgroundColor = BTN_COLORS.GREEN
    btnReady.textContent = BTN_STATES.BTN_READY
}

function setButtonUnReady() {
    btnReady.style.backgroundColor = BTN_COLORS.RED
    btnReady.textContent = BTN_STATES.BTN_NOT_READY
}
