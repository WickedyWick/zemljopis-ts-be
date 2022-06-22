const roomReg = /^[A-Za-z0-9]{8}$/g
const usernameReg = /^[A-Za-z0-9а-шА-ШčČćĆžŽšŠđĐђјљњћџЂЈЉЊЋЏ ]{4,16}$/g
const tokenReg = /^[A-Za-z0-9]{48}$/g
let pridruziBtn = document.getElementById('pridruzi')
let usernameInput = document.getElementById('txb_username')
let roomCodeInput = document.getElementById('txb_roomCode')
let roundTimeDDL = document.getElementById('roundTimeLimit')
let playerNumberDDL = document.getElementById('playerNumber')
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

napraviBtn.addEventListener('click', (e) =>{
    console.log('posting...')
    const username = usernameInput.value.trim()
    disableButtons()
    if (usernameReg.test(username)) {
        const playerCount = playerNumberDDL.value
        const roundTimeLimit = roundTimeDDL.value
        
        axios({
            method: 'post',
            url: '/home/createGame',
            data: {
                "username": username,
                "playerCount": playerCount,
                "roundTimeLimit": roundTimeLimit
            }
        }).then((res) => {
            if(res.status == 500) {
                myAlert(res.data["ERR_MSG"])
                enableButtons()
            }else if(res.status >= 200 && res.status < 300){               
                localStorage.setItem('sessionToken',res.data['sessionToken'])
                window.location.href = `/game?roomCode=${res.data['roomCode']}&username=${username}`
            } else {
                myAlert("Doslo je do problema , pokusajte ponovo!")
                enableButtons()
            }
        }).catch((err) => {
            // handle better
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

pridruziBtn.addEventListener('click', (e) => {
    e.preventDefault()
    const username = usernameInput.value.trim()
    const room = roomCodeInput.value.trim()
    disableButtons()
    if (roomReg.test(room) && usernameReg.test(username)) {
        axios({
            method: 'post',
            url: '/home/regUser',
            data: {
                "username": username,
                "roomCode": room
            }
        }).then((res) => {
            console.log(res.status)
            console.log(res.data)
            if (res.status >= 500){
                myAlert(res.data["ERR_MSG"])
                enableButtons()
            }else if(res.status >= 200 && res.status < 300) {
                localStorage.setItem('sessionToken',res.data['sessionToken'])
                window.location.href = `/game?roomCode=${res.data['roomCode']}&username=${res.data['username']}`
            } else {
                myAlert('Doslo je do problema!')
                enableButtons()
            }
        }).catch((err) => {
            console.log(err)
            enableButtons()
        })
    }

})

