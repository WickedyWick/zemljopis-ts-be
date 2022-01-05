
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
pridruziBtn.addEventListener('click',(e)=>{  
    e.preventDefault();
    let username = usernameInput.value.trim()
    let room = roomCodeInput.value.trim()
    disableButtons()
    if(roomReg.test(room) && usernameReg.test(username)){ 
        /*      
        socket.emit('joinRoomSQL',{username,room})                */
        let statusCode;
        fetch(`${serverAddress}joinRoomSQL`,{
            method: "POST",
            body : JSON.stringify({"username":username,"roomCode":room}),
            headers : {"Content-type":"application/json; charset=UTF-8"}
        })
        .then(response => {statusCode = response.status; response.json().then(json =>{  
            if(statusCode == 500){
                myAlert(json["ERR_MSG"])
                enableButtons()
            }else if(statusCode == 201){               
                localStorage.setItem('sessionToken',json['sessionToken'])
                window.location.href = `/game?roomCode=${json['roomCode']}&username=${json['username']}`
            }
        })}).catch(err => {console.log('err')})
        
    }else{
        if(!roomReg.test(room) && !usernameReg.test(username)){
            //mylaertuj za o
            myAlert('Korisnicko ime mora da bude barem 4 karaktera dugacko, a najviše 20, dozvoljena pisma su sprska latinica,cirilica i engleski alfabet!\nSoba se sastoji od 8 alfanumerickih karaktetra!')
        }else if(!roomReg.test(room)){
            // ako je soba invalidnog formata
            myAlert('Soba se sastoji od 8 alfanumerickih karaktetra!')
        }
        else{
            //ako je useranme invalidnog formnata
            myAlert('Korisnicko ime mora da bude barem 4 karaktera dugacko, a najviše 20, dozvoljena pisma su sprska latinica, cirilica i engleski alfabet!')
        }
        enableButtons()
    }
    roomReg.lastIndex =-1;
    usernameReg.lastIndex = -1;
})
       
napraviBtn.addEventListener('click',(e)=>{
    e.preventDefault(); 
    let username =usernameInput.value.trim()
    disableButtons()  
    if(usernameReg.test(username)){
        let playerCount = playerNumberDDL.value
        let roundTimeLimit = roundTimeDDL.value
        let statusCode;
        fetch(`${serverAddress}createRoom`,{
            method: "POST",
            body : JSON.stringify({"username":username,"playerCount":playerCount,"roundTimeLimit":roundTimeLimit}),
            headers : {"Content-type":"application/json; charset=UTF-8"}
        })
        .then(response => {statusCode = response.status; response.json().then(json =>{
            if(statusCode == 500){
                myAlert(json["ERR_MSG"])
                enableButtons()
            }else if(statusCode == 201){
                
                localStorage.setItem('sessionToken',json['sessionToken'])       
                window.location.href = `/game?roomCode=${json['roomCode']}&username=${json['username']}`;
            }
        })}).catch(err => {console.log('err')})
        

        //socket.emit('createRoom',{username,playerCount,roundTimeLimit});
    }else{
        myAlert("Korisnicko ime mora da bude barem 4 karaktera dugacko, a najviše 20,  dozvoljena pisma su sprska latinica, cirilica i engleski alfabet!")
        enableButtons()
    }
    usernameReg.lastIndex = -1;
})
vratiBtn.addEventListener('click',(e)=>{
    e.preventDefault();
    disableButtons()
    let sessionToken = localStorage.getItem('sessionToken')
    let roomCode = localStorage.getItem("roomCode")
    let username = localStorage.getItem("username")
    if(tokenReg.test(sessionToken)){

        if(usernameReg.test(username) && roomReg.test(roomCode)){
           
            window.location.href = `/game?roomCode=${roomCode}&username=${username}`;
        }else{
        /*
        socket.emit("returnRoom",sessionToken)*/
            let statusCode;
            console.log(sessionToken)
            fetch(`${serverAddress}returnRoom/${sessionToken}`, {
            method: "GET",
            headers: {"Content-type": "application/json;charset=UTF-8"}
            })
            .then(response => {statusCode = response.status;response.json().then(json => { 
                if(statusCode == 500){
                    myAlert(json['ERR_MSG'])
                    enableButtons()
                }else if(statusCode == 200){
                    window.location.href = `/game?roomCode=${json['roomCode']}&username=${json['username']}`;
                }
            })}).catch(err => {console.log('err')}) 
        }
        
    }else{
        enableButtons()
        myAlert("Nije se moguće vratiti u sobu, napravite novu ili se pridružite drugoj sobi!")
    }      
    tokenReg.lastIndex = -1;
    usernameReg.lastIndex = -1;
    roomReg.lastIndex = -1;
   
})