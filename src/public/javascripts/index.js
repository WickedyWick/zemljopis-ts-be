axios.defaults.headers.post['Content-type'] = 'application/json; charset=UTF-8'


const serverAddress = serverAdress()
let povezan = false;
const roomReg = /^[A-Za-z0-9]{8}$/g
const usernameReg = /^[A-Za-zа-шА-ШčČćĆžŽšŠđĐђјљњћџЂЈЉЊЋЏ ]{4,16}$/g
const tokenReg = /^[A-Za-z0-9]{48}$/g
let pridruziBtn = document.getElementById('pridruzi')
let usernameInput = document.getElementById('txb_username')
let roomCodeInput = document.getElementById('txb_roomCode')
let roundTimeDDL = document.getElementById('roundTimeLimit')
let playerNumberDDL = document.getElementById('playerNumber')
const roomReg = /^[A-Za-z0-9]{8}$/g
const usernameReg = /^[A-Za-zа-шА-ШčČćĆžŽšŠđĐђјљњћџЂЈЉЊЋЏ ]{4,16}$/g
const tokenReg = /^[A-Za-z0-9]{48}$/g

let napraviBtn = document.getElementById('napravi')
let vratiBtn = document.getElementById('vrati')
function disableButtons(){
    $(pridruziBtn).prop("disabled", true )
    $(napraviBtn).prop("disabled", true )
    $(vratiBtn).prop("disabled", true )

}
function enableButtons(){
    $(pridruziBtn).prop("disabled", false )
    $(napraviBtn).prop("disabled", false )
    $(vratiBtn).prop("disabled", false )

}

function myAlert(test){
    $("#danger-alert").html(`<a href="#" class="close" data-dismiss="alert">&times;</a><strong>Failure</strong> ${test}`)
    $("#danger-alert").fadeTo(7000, 500).slideUp(500, () =>{
        $("#danger-alert").slideUp(500);
    });   
}

document.getElementById('napravi').addEventListener('click', (e) =>{
    console.log('posting...')
    const username = usernameInput.value.trim()
    disableButtons()
    if (usernameReg.test(username)) {
        const playerCount = playerNumberDDL.value
        const roundTimeLimit = roundTimeDDL.value
        axios.post('/createGame', {
            'username': username,
            'roundTimeLimit': roundTimeLimit,
            'playerCount': playerCount
        }).then((res) => {
            if(res.status == 500) {
                myAlert(res.data["ERR_MSG"])
                enableButtons()
            }else if(statusCode == 200){               
                localStorage.setItem('sessionToken',res.data['sessionToken'])
                window.location.href = `/game?roomCode=${res.data['roomCode']}&username=${res.data['username']}`
            } else {
                myAlert(res.data["ERR_MSG"])
                enableButtons()
            }
        }).catch((err) => {
            console.log(err)
            enableButtons()
        })
    } else {
        myAlert("Korisnicko ime mora da bude barem 4 karaktera dugacko, a najviše 20,  dozvoljena pisma su sprska latinica, cirilica i engleski alfabet!")
        enableButtons()
    }
    roomReg.lastIndex =-1;
    usernameReg.lastIndex = -1;
})

