import { N_TYPE, BTN_COLORS, BTN_STATES, SessionTokenRegEx, UsernameRegEx, RoomCodeRegEx, FieldDataRegExString, letterDictionary, IndexField, CatToShort } from './game.consts.js'
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
let dataSent = false
let playerCount = 0
let playersReady = 0
let roundTimeLimitConst = 0
let roundTimeLimit =0
let ready = false
let gameStarted = false
let points = 0
let intervalId = null
let lblPlayerCount = null
let lblPlayerReady = null
let lblRoundNumber = null
let lblPoints = null
let lblRoomCode = null
let lblTimer = null
let lblCurrentLetter = null
let btnReady = null
let ddlRoundSelect = null
let currentLetter = ''

let txbDrzava = null
let txbGrad = null
let txbIme = null
let txbBiljka = null
let txbZivotinja = null
let txbPlanina = null
let txbReka = null
let txbPredmet = null
let fieldData = new Map()
let players = new Map()
export const load = (_username, _roomCode, _sessionToken) => {
    const usernameReg = new RegExp(UsernameRegEx, 'g').test(_username)
    const roomCodeReg = new RegExp(RoomCodeRegEx, 'g').test(_roomCode)
    const sessionTokenReg = new RegExp(SessionTokenRegEx, 'g').test(_sessionToken)
    if(usernameReg && roomCodeReg && sessionTokenReg) {
        username = _username
        roomCode = _roomCode
        sessionToken = _sessionToken
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
        txbDrzava = document.getElementById('inputDrzava')
        txbGrad = document.getElementById('inputGrad')
        txbIme = document.getElementById('inputIme')
        txbBiljka = document.getElementById('inputBiljka')
        txbZivotinja = document.getElementById('inputZivotinja')
        txbPlanina = document.getElementById('inputPlanina')
        txbReka = document.getElementById('inputReka')
        txbPredmet = document.getElementById('inputPredmet')
        lblCurrentLetter = document.getElementById('lblCurrentLetter')
    } else {
        //not and send back
    }

}

// maybe this should be wrapped in class
/**
 * @param  {number} CODE
 * @param  {string} MSG
 * @param  {points} string
 * @param  {string} ready
 * @param  {string} playersReady(0)
 * @param  {string} playerCount(1)
 * @param  {string} roundNumber(2)
 * @param  {string} roundTimeLimit(3)
 * @param  {string} gameInProgress(4)
 * @param  {string[]} players
 * 
 */
export const joinRoomResponse = (data) => {
    if(data.code == 200) {
        $('#maxDiv').show()
        ready = data['ready'] === "1"
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
        lblRoundNumber.textContent = data['2']
        $('#poeni').text(data['points'])
        $('#localPlayer').text(username)
        $('#lblRoomCode').append(roomCode)
        roundTimeLimitConst = Number(data['3'])
        roundTimeLimit = roundTimeLimitConst
        lblTimer.textContent = data['3']
        sessionToken = localStorage.getItem('sessionToken')
        localStorage.setItem("roomCode",roomCode)
        localStorage.setItem("username",username)
        for( let i = 0; i < data['2']; i++) {
            ddlRoundSelect.options.add(new Option(`${i+1}`, `${i+1}`))
        }
        ddlRoundSelect.selectedIndex = data['2'] -1
        notify(N_TYPE.SUCCESS, 'Uspesno ste se pridruzili sobi')
        if(data['4'] == '1') {
            btnReady.disabled = true
            disableAllInputFields()
            gameStarted = true;
            notify(N_TYPE.SUCCESS, 'Sačekajte sledecu rundu da bi ste nastavili da igrate!')
        }
        points = Number(data['points'])
        players.set(username, points)
        for( let i = 0; i < data['players'].length; i++) {
            if(data['players'][i] != username) {https://app.asana.com/0/1201761066131098//f
                $('#players').append(`<li>${data['players'][i]}</li>`)
                players.set(data['players'][i], 0)
            }
        }
    } else {
        $('#maxDiv').hide()
        notify(N_TYPE.WARNING, 'Korisnicko ime i ili soba nisu vazeci!')
    }
}

/**
 * This function handles playerReady response from the server
 * @param  {string} username
 * @param  {number} CODE
 * @param  {number} playersReady
 */
export const playerReadyResponse = (data) => {
    /*
    username: string,
    CODE: number
    playersReady: number
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

    // -1 if nothing has to be changed saved some BE overhead ( maybe not worth it for sake of consistency?)
    if(data.playersReady != -1)
        $('#lblPlayersReady').text(data.playersReady)
    
}

/**
 * This function handles playerUnReady response from the server
 * @param  {string} username
 * @param  {number} CODE
 * @param  {number} playersReady
 */
export const playerUnReadyReadyHandler = (data) => {
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
    // -1 if nothing has to be changed 
    if(data.playersReady != -1)
        $('#lblPlayersReady').text(data.playersReady)
}

export const btnClickHandler = async() => {
    if(gameStarted) {
        fieldData = await checkAndCollectData()
        if (fieldData == false) {
            notify('warning', 'Format podatak nije validan!')
            fieldData = new Map()
            return
        }
 
        await convertDataToLatinic(fieldData)
        const res = Object.fromEntries(fieldData)

        await sendFieldData(res, true)
        dataSent = true
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

/**
 * Function that handles result response
 * @param  {[key: string]: string} data - Pointed data
 */
export const resultHandler = async(data) => {
    dataSent = false
    gameStarted = false
    ready = false
    disableAllInputFields()
    setButtonUnReady()
    btnReady.disabled = false
    roundTimeLimit = -1
    if (data.CODE != 200) {
        // error
        notify('warning', `Došlo je do problema prilikom evaluacije rešenja.`)
        return
    }
    await delete data.CODE
    //iteratuj kroz nasa polja i gledaj has iz dictionarija
    const results = new Map(Object.entries(data))
    for (const [key, val] of fieldData.entries()) {
        const keyF = IndexField[key]
        if (results.has(`${val}_${keyF}`)) {
            let p = results.get(`${val}_${keyF}`)
            updateFieldWithPoints(keyF, p)
            points += p
        } else {
            updateFieldWithPoints(keyF, 0)
        }
    }

    lblPoints.textContent = String(points)
    lblPlayerReady.textContent = '0'
}

/**
 * Game start function handler
 * @param {string} letter - Letter that words should start with
 * @param {string} roundNumber - Round number of the game
 */

export const gameStart = async(data) => {
    gameStarted = true
    const { letter, roundNumber } = data
    
    if (letter == 'KRAJ IGRE') {
        btnReady.disabled = true
        disableAllInputFields()
        enableAllPButtons()
        setButtonGameEnd()
        notify('sucess', `Kraj igre, soba će se uskoro zatvoriti`)
        return
    }
    clearAllInputFields()
    setButtonGameStarted()
    enableAllInputFields()
    disableAllPButtons()
    currentLetter = letter
    lblCurrentLetter.textContent = `Slovo: ${letter}`
    ddlRoundSelect.options.add(new Option(`${roundNumber}`, `${roundNumber}`))
    ddlRoundSelect.selectedIndex = roundNumber - 1
    lblRoundNumber.textContent = String(roundNumber)
    lblTimer.textContent = roundTimeLimitConst
    roundTimeLimit = roundTimeLimitConst
    // start timer
    let intervalId = setInterval(async() => {
        roundTimeLimit--
        lblTimer.textContent = String(roundTimeLimit)
        if(roundTimeLimit == 0) {
            if (!dataSent)  {
                await sendDataTimerOrForce(false)
            }
        }
        if (roundTimeLimit < 0) {
            lblTimer.textContent = '0'
            clearInterval(intervalId)
        } 
    }, 1000)
}

export const sendDataTimerOrForce = async(force) => {
    fieldData = await collectData()
    await convertDataToLatinic(fieldData)
    const res = Object.fromEntries(fieldData)
    await sendFieldData(res, force)
    dataSent = true
    btnReady.disabled = true
    roundTimeLimit = -1
    disableAllInputFields()
    disableAllPButtons()
    
}
/**
 * This event is triggered when another player joins the room
 * @param  {string} username
 * @param  {number} points
 */
export const anotherPlayerJoin = async(data) => {
    if (!players.has(data['username'])) {
        $('#players').append(`<li>${data['username']}</li>`)
        players.set(data['username'], Number(data['points']))
    }
    notify('success', `${username} se pridružio sobi.`)
}

/**
 * Updates field by category with its value
 * @param  {number} index - Category
 * @param  {number} value - Number of points 
 */
const updateFieldWithPoints = async(category, value) => {
    if ( value == 0) enablePButtonByCat(category)

    switch (category) {
        case 0:
            txbDrzava.value += `  + ${ value }`
            break;
        case 1:
            txbGrad.value += `  + ${ value }`
            break;
        case 2:
            txbIme.value += `  + ${ value }`
            break;
        case 3:
            txbBiljka.value += `  + ${ value }`
            break;
        case 4:
            txbZivotinja.value += `  + ${ value }`
            break;
        case 5:
            txbPlanina.value += `  + ${ value }`
            break;
        case 6:
            txbReka.value += `  + ${ value }`
            break;
        case 7:
            txbPredmet.value += `  + ${ value }`
            break;
        default: 
            break;
    }
}
/**
 * This function collects , validates and returns boolean and data if its valid
 * @returns {boolean}
 */

const checkAndCollectData = async() => {
    try {
        const data = new Map()
        const fieldDataRegEx = new RegExp(FieldDataRegExString,'g')
       
        let dr = txbDrzava.value.toLowerCase()
        if (fieldDataRegEx.test(dr))
            data.set('dr', dr)
        else 
            return false
        fieldDataRegEx.lastIndex = -1
        
        let gr = txbGrad.value.toLowerCase()
        if (fieldDataRegEx.test(gr))
            data.set('gr',gr)
        else 
            return false
        fieldDataRegEx.lastIndex = -1
        
        let im = txbIme.value.toLowerCase()
        if (fieldDataRegEx.test(im))
            data.set('im',im)
        else 
            return false
        fieldDataRegEx.lastIndex = -1
    
        let bl = txbBiljka.value.toLowerCase()
        if (fieldDataRegEx.test(bl))
            data.set('bl', bl)
        else 
            return false
        fieldDataRegEx.lastIndex = -1
    
        let zv = txbZivotinja.value.toLowerCase()
        if (fieldDataRegEx.test(zv))
            data.set('zv', zv)
        else 
            return false
        fieldDataRegEx.lastIndex = -1
    
        let pl = txbPlanina.value.toLowerCase()
        if (fieldDataRegEx.test(pl))
            data.set('pl', pl)
        else 
            return false
        fieldDataRegEx.lastIndex = -1
    
        let rk = txbReka.value.toLowerCase()
        if (fieldDataRegEx.test(rk))
            data.set('rk', rk)
        else 
            return false
        fieldDataRegEx.lastIndex = -1
    
        let pr = txbPredmet.value.toLowerCase()
        if (fieldDataRegEx.test(pr))
            data.set('pr', pr)
        else 
            return false
        fieldDataRegEx.lastIndex = -1
    
        return data
    } catch (e) {
        console.error(e)
        return false
    }  
}


/**
 * This function collects and validates data to be sent for evaluation and returns it
 * @returns {[key: string]: string}
 */

const collectData = async() => {
    try {
        const data = new Map()
        const fieldDataRegEx = new RegExp(FieldDataRegExString,'g')
       
        let dr = txbDrzava.value.toLowerCase()
        if (fieldDataRegEx.test(dr))
            data.set('dr', dr)
        else 
            data.set('dr', '')
        fieldDataRegEx.lastIndex = -1
        
        let gr = txbGrad.value.toLowerCase()
        if (fieldDataRegEx.test(gr))
            data.set('gr', gr)
        else 
            data.set('gr', '')
        fieldDataRegEx.lastIndex = -1
    
        let im = txbIme.value.toLowerCase()
        if (fieldDataRegEx.test(im))
            data.set('im', im)
        else 
            data.set('im', '')
        fieldDataRegEx.lastIndex = -1
    
        let bl = txbBiljka.value.toLowerCase()
        if (fieldDataRegEx.test(bl))
            data.set('bl', bl)
        else 
            data.set('bl', '')
        fieldDataRegEx.lastIndex = -1
    
        let zv = txbZivotinja.value.toLowerCase()
        if (fieldDataRegEx.test(zv))
            data.set('zv', zv)
        else 
            data.set('zv', '')
        fieldDataRegEx.lastIndex = -1
    
        let pl = txbPlanina.value.toLowerCase()
        if (fieldDataRegEx.test(pl))
            data.set('pl', pl)
        else 
            data.set('pl', '')
        fieldDataRegEx.lastIndex = -1
    
        let rk = txbReka.value.toLowerCase()
        if (fieldDataRegEx.test(rk))
            data.set('rk', rk)
        else 
            data.set('rk', '')
        fieldDataRegEx.lastIndex = -1
    
        let pr = txbPredmet.value.toLowerCase()
        if (fieldDataRegEx.test(pr))
            data.set('pr', pr)
        else 
            data.set('pr', '')
        fieldDataRegEx.lastIndex = -1
    
        return data
    } catch (e) {

        console.error(e)
        return await new Map(Object.entries({
            'dr': '',
            'gr': '',
            'im': '',
            'bl': '',
            'zv': '',
            'pl': '',
            'rk': '',
            'pr': ''
        }))
    }  
}


/**
 * This function iterates data and alters it to make sure its latinic
 * @param  {Map<string,string>} fieldData - Original data that may be altered
 */
const convertDataToLatinic = async(fieldData) => {
    for (const [key, val] of fieldData.entries()) {
        const word = await cyrilicToLatinic(val)
        await fieldData.set(key, word)
    }
}


/**
 * This function sends field data to the backend
 * @param  {[key: string]: string} data - Field data that is send to the backend
 */
const sendFieldData = async(data, forced) => {
    socket.emit(
        SOCKET_EVENTS.RECEIVE_DATA,
        {
            username,
            roomCode,
            sessionToken,
            dr: await data.dr,
            gr: await data.gr,
            im: await data.im,
            bl: await data.bl,
            zv: await data.zv,
            pl: await data.pl,
            rk: await data.rk,
            pr: await data.pr,
            forced
        }
    )

}


/**
 * This function makes sure latinic word is passed to the backend
 * @param  {string} word - Word to be converted
 * @returns {string}
 */
const cyrilicToLatinic = async(word) => {
    let newWord = ''
    for (let i =0; i < word.length; i++) {
        try {
            if (letterDictionary.has(word[i]))
                newWord+= letterDictionary.get(word[i])
            else 
                newWord += word[i]
        } catch(e) {
            console.log(e)
            newWord+= word[i]
        }
    }
    return newWord
}
export const wordSuggest = async(category) => {
    const word = await fieldData.get(CatToShort[category])
    const reg = new RegExp(FieldDataRegExString)
    if (reg.test(word)) {
        socket.emit(SOCKET_EVENTS.WORD_SUGGESTION, ({
            username,
            roomCode,
            sessionToken,
            word,
            category,
            currentLetter
        }))
        return
    } 
    enablePButtonByCat(category)
    notify('warning', `Reč nije pravilna.`)
}
/**
 * @param  {number} CODE - response code 
 * @param  {category} category - category tried to be suggested
 * @param  {string} MSG? - optional message , only for erros
 */
export const wordSuggestionHandler = async(data) => {
    if (data.CODE >= 300) {
        notify('error', data.MSG)
        enablePButtonByCat(data.category)
        return
    }
    notify('success', 'Reč predložena')
    disablePButtonByCat(data.category)
}

/**
 * @param  {string} type - Type of notification
 * @param  {string} message - Message to be shown
 */
const notify = (type, message) => {
    // type: warning, info, success
    new Noty({  
        theme : 'metroui',
        type : type,
        layout : 'topRight',
        text : message,
        timeout : 5000,
        progressBar :true
    }).show()
}

export const disablePButtonByCat = (category) => {
    document.getElementById(`predloziBtn_${category}`).disabled = true
}

export const enablePButtonByCat = (category) => {
    document.getElementById(`predloziBtn_${category}`).disabled = false
}

const disableAllPButtons = () => {
    for( let i = 0; i < 8; i++) {
        document.getElementById(`predloziBtn_${i}`).disabled = true
    }
}
const enableAllPButtons = () => {
    for( let i = 0; i < 8; i++) {
        document.getElementById(`predloziBtn_${i}`).disabled = false
    }
} 
const hideAllHelp = () => {
    $("#helpDrzava").hide()
    $("#helpGrad").hide()
    $("#helpPredmet").hide()
    $("#helpIme").hide()
    $("#helpBiljka").hide()
    $("#helpReka").hide()
    $("#helpPlanina").hide()
    $("#helpZivotinja").hide()
} 
const clearAllInputFields = () => {
    $("#inputDrzava").val('')
    $("#inputGrad").val('')
    $("#inputPredmet").val('')
    $("#inputIme").val('')
    $("#inputBiljka").val('')
    $("#inputReka").val('')
    $("#inputPlanina").val('')
    $("#inputZivotinja").val('')
} 
const disableAllInputFields= () => {
    $("#inputDrzava").prop("disabled", true )
    $("#inputGrad").prop("disabled", true )
    $("#inputPredmet").prop("disabled", true )
    $("#inputIme").prop("disabled", true )
    $("#inputBiljka").prop("disabled", true )
    $("#inputReka").prop("disabled", true )
    $("#inputPlanina").prop("disabled", true )
    $("#inputZivotinja").prop("disabled", true )

} 
const enableAllInputFields = () => {
    $("#inputDrzava").prop("disabled", false )
    $("#inputGrad").prop("disabled", false )
    $("#inputPredmet").prop("disabled", false )
    $("#inputIme").prop("disabled", false )
    $("#inputBiljka").prop("disabled", false )
    $("#inputReka").prop("disabled", false )
    $("#inputPlanina").prop("disabled", false )
    $("#inputZivotinja").prop("disabled", false )
}
     
const setButtonReady = () => {
    btnReady.style.backgroundColor = BTN_COLORS.GREEN
    btnReady.textContent = BTN_STATES.BTN_READY
}

const setButtonUnReady = () => {
    btnReady.style.backgroundColor = BTN_COLORS.RED
    btnReady.textContent = BTN_STATES.BTN_NOT_READY
}

const setButtonGameStarted = () => {
    btnReady.style.backgroundColor = BTN_COLORS.GREEN
    btnReady.textContent = BTN_STATES.BTN_GAME_STARTED
}

const setButtonGameEnd = () => {
    btnReady.style.backgroundColor = BTN_COLORS.GREEN
    btnReady.textContent = BTN_STATES.BTN_GAME_END
}
const updateRound = () => {
    lblRoundNumber.textContent = String(Number(lblRoundNumber.textContent) + 1)
}