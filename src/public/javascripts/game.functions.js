// player count label lblPlayerCount
// player ready label lblPlayersReady
// round number label roundNumber
// points label poeni
// username localPlayer
// roomCode lblRoomCode
// timer counter
// ready button btnReady
// round list roundSelect

let playerCount = 0
let playersReady = 0
let sessionToken = ''
let ready = false
const nType = {
    SUCCESS: 'success',
    WARNING: 'warning'
}

const btnColors = {
    RED: 'red',
    GREEN: 'green'
}
const btnStates = {
    BTN_NOT_READY: 'Nisi spreman!',
    BTN_REDAY: 'Spreman!'
}
const {username, roomCode} = Qs.parse(location.search,{
    ignoreQueryPrefix: true
})

// maybe this should be wrapped in class
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
export const joinRoom = (data) => {
    /*
    CODE: 200/404
    MSG?: string (error)
    points: string
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
        notify(nType.SUCCESS, 'Uspesno ste se pridruzili sobi')
        if(data['4'] == '1') {
            $('#btnReady').prop('disabled', true)
            disableAllInputFields()
            gameStarted = true;
            notify(nType.SUCCESS, 'Sačekajte sledecu rundu da bi ste nastavili da igrate!')
        }
        for( let i = 0; i < data['players'].length; i++) {
            if(data['players'][i] != username)
                $('#players').append(`<li>${data['players'][i]}</li>`)
        }
    } else {
        $('#maxDiv').hide()
        notify(nType.WARNING, 'Korisnicko ime i ili soba nisu vazeci!')
    }
}

export const playerReady = (data) => {
    /*
    username: string,
    CODE: number
    */
    if(data.CODE > 400) {
        //alert
        $('#readyBtn').css('color', btnColors.RED)
        $('#readyBtn').text(response.BTN_NOT_READY)
        $('#readyBtn').prop('disabled', false)
        ready = false
        notify(nType.WARNING, 'Doslo je do problema pokusajte ponovo')
        return
    } 
    if(data.username == username) {
        $('#readyBtn').css('color', btnColors.GREEN)
        $('#readyBtn').text(response.BTN_READY)
        $('#readyBtn').prop('disabled', false)
        ready = true
        notify(nType.SUCCESS, 'Spremni ste!')
    }
    if(playersReady < playerCount)
        playersReady++
    $('#lblPlayersReady').text(playersReady)
    
}

export const playerUnReady = (data) => {
    /*
    username: string,
    CODE: number
    */
    if(data.CODE > 400) {
        //alert
        $('#readyBtn').css('color', btnColors.RED)
        $('#readyBtn').text(response.BTN_NOT_READY)
        $('#readyBtn').prop('disabled', false)
        ready = false
        notify(nType.WARNING, 'Doslo je do problema pokusajte ponovo')
        return
    } 
    if(data.username == username) {
        $('#readyBtn').css('color', btnColors.GREEN)
        $('#readyBtn').text(response.BTN_READY)
        $('#readyBtn').prop('disabled', false)
        ready = true
        notify(nType.SUCCESS, 'Niste spremni')
    }
    // maybe return player count? :D
    if(playersReady > 0)
        playersReady--
    $('#lblPlayersReady').text(playersReady)
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