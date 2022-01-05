data = {}
const {username, roomCode} = Qs.parse(location.search,{
        ignoreQueryPrefix: true
    })
let readyBtn = document.getElementById('btnReady')
let gameStarted = false
let ready = false;
let timer = document.getElementById('counter')
let myInterval;
let roundNumber;
let t0;
let t1;
let points = 0;
let currentLetter = ''
let dataReg = new RegExp()
let pList = {}
let pListKeys;
let kicked = false
let historyData = {}
let vreme = 0;
historyData[username] = {}
let select = document.getElementById('roundSelect')
const fields = ['Drzava','Grad','Ime','Biljka','Zivotinja','Planina','Reka','Predmet']
const dataDictKeys = ['drzava','grad','ime','biljka','zivotinja','planina','reka','predmet']
const kDict = {'Drzava':'d','Grad':'g','Ime':'i','Biljka':'b','Zivotinja':'z','Planina':'p','Reka':'r','Predmet':'pr'}
const sessionReg = /^[A-Za-z0-9]{48}$/g
let lblPlayerCount = document.getElementById('lblPlayerCount')
let lblPlayersReady = document.getElementById('lblPlayersReady')
let lblRoundNumber =document.getElementById('roundNumber')
let lblPoeni = document.getElementById('poeni')
// dodaj start button za leadera
serverAddress = serverAdress()
const socket = io(serverAddress);
socket.on('message', message =>{
    
})

socket.on('joinMessage', message =>{
    
})
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
function disableHistoryReq(){
    
    $("#localPlayer").css("pointer-events","none");
    for(let i =0;i<pListKeys.length;i++){
    $(`#${pListKeys[i]}`).css("pointer-events","none")
    }
}
function enableHistoryReq(){
    $("#localPlayer").css("pointer-events","auto");
    for(let i =0;i<pListKeys.length;i++){
    $(`#${pListKeys[i]}`).css("pointer-events","auto")
    }
}
function enableKick(){
    for(let i=0;i<pListKeys.length;i++){
        $(`#span${pListKeys[i]}`).css('pointer-events','auto')
        }
}
function disableKick(){
    for(let i=0;i<pListKeys.length;i++){
        $(`#span${pListKeys[i]}`).css('pointer-events','none')
        }
}
//popup alert multi use
function myAlert(test){
    $("#vote-alert").show()
    $("#vote-alert").html(`<div style="text-align: center"><a href="#" class="close" data-dismiss="alert" >&times;</a><label class="vLabel">Glasanje da se izbaci igrač : ${test}</label> <button class="btn myVBtn" style="font-size:14px;padding:3px;padding-right:10px" id="forVoteKick" onclick="voteFor()">Za</button><button class="btn myVBtn" style="font-size:14px;padding:3px" id="againstVoteKick" onclick="voteAgainst()">Protiv</button></div> `)
    
    $("#vote-alert").fadeTo(7000)
        
    
    
}
// glas za
function voteFor(){
    mode = "FOR"
    socket.emit("voteKickCounter",({username,roomCode,mode}))
    $("#vote-alert").html("")
    $("#vote-alert").slideUp(500)
    $("#vote-alert").hide()
    
}
//glas protiv
function voteAgainst(){
    mode = "AGAINST"
    socket.emit("voteKickCounter",({username,roomCode,mode}))
    $("#vote-alert").html("")
    $("#vote-alert").slideUp(500)
    $("#vote-alert").hide()
}
//funcija za trazenje istorije drugih igraca
function historyReq(player){
    $(`#${player}`).css("pointer-events","none"); 
    let targetRound = select.value
    disableAllPButtons()
    disableAllInputFields()
    if(targetRound != roundNumber){
    if(player in historyData){
        if(targetRound in historyData[player]){
        let arr = historyData[player][targetRound] 
        for(let i =0;i < dataDictKeys.length;i++){
            $(`#input${fields[i]}`).val(arr[i])
        
        }
        $(`#${player}`).css("pointer-events","auto");
        }else{
        socket.emit('historyReq',({roomCode,player,targetRound}))
        }
    }else{
        //socket emituj request za rundu i username
        historyData[player] = {}
        socket.emit('historyReq',({roomCode,player,targetRound}))
    }
    }else{
    new Noty({
            theme : 'metroui',
            type : 'info',
            layout : 'topRight',
            text : `Trenutna runda još nije završena.`,
            timeout : 5000,
            progressBar :true
        }).show()
        $(`#${player}`).css("pointer-events","auto");
    }
    
}
//ako localplayer trazi istoriju
document.getElementById("localPlayer").addEventListener('click',(e)=>{
    $("#localPlayer").css("pointer-events","none"); //not clicable 
    let targetRound = select.value
    disableAllInputFields()
    disableAllPButtons()
    if(targetRound != roundNumber){
    if(username in historyData){
        if(targetRound in historyData[username]){
        let arr = historyData[username][targetRound]
        for(let i =0;i < dataDictKeys.length;i++){
            $(`#input${fields[i]}`).val(arr[i])
            
        }
        $("#localPlayer").css("pointer-events","auto");
        }else{
        let player = username
        socket.emit('historyReq',({roomCode,player,targetRound}))
        }
    }else{
        historyData[username] = {}
        let player = username
        socket.emit('historyReq',({roomCode,player,targetRound}))
    }
    }else{
    new Noty({
            theme : 'metroui',
            type : 'info',
            layout : 'topRight',
            text : `Trenutna runda još nije završena.`,
            timeout : 5000,
            progressBar :true
        }).show()
        $("#localPlayer").css("pointer-events","auto");
    }
    
    //alert('test')
})
//daje requestovane podatke istorije
socket.on('historyReqResponse',message=>{
    enableHistoryReq()
    
    if(message['Success']){
    new Noty({
            theme : 'metroui',
            type : 'info',
            layout : 'topRight',
            text : `Prikazani podaci za ${message['username']} u rundi ${message['round']}`,
            timeout : 5000,
            progressBar :true
        }).show()
        let data = message['Data']
        let arr = []
        //historyData[message['username']][message['round']] = data
        if(message['username'] == username){
        for(let i =0;i < dataDictKeys.length;i++){
            $(`#input${fields[i]}`).val(data[dataDictKeys[i]])
            arr.push(data[dataDictKeys[i]])
            
        }               
        }else{
        for(let i =0;i < dataDictKeys.length;i++){
            $(`#input${fields[i]}`).val(data[dataDictKeys[i]])
            arr.push(data[dataDictKeys[i]])
            
        }
        }
        historyData[message['username']][message['round']] = arr           
    }else{
    new Noty({
            theme : 'metroui',
            type : 'warning',
            layout : 'topRight',
            text : message['ERR_MSG'],
            timeout : 5000,
            progressBar :true
        }).show()
    }
})
//rezultat kikovanja
socket.on('kickResult',message=>{
    if(message['Success']){
    if(message['username'] == username){
        kicked = true;
        if(ready)
        socket.emit('playerUnReady',roomCode)              
        $("#vote-alert").html("")
        $("#vote-alert").hide()             
        $("#maxDiv").hide()
        new Noty({
            theme : 'metroui',
            type : 'error',
            layout : 'topRight',
            text : message['SPEC_MSG'],
            timeout : 5000,
            progressBar :true
        }).show()
        setTimeout(()=>{
            window.location.href = "/"
        },5000)
    }else{
        $("#vote-alert").html("")
        $("#vote-alert").hide()
        lblPlayerCount.textContent = String(Number(lblPlayerCount.textContent) -1)
        node = document.getElementById(`${message['username']}`)
        node.parentNode.removeChild(node);
        delete pList[message['username']]
        pListKeys= Object.keys(pList)
        enableKick()
        new Noty({
            theme : 'metroui',
            type : 'success',
            layout : 'topRight',
            text : message['MSG'],
            timeout : 5000,
            progressBar :true
        }).show()                
    }
    }else{
    $("#vote-alert").html("")
    $("#vote-alert").hide()
    
    enableKick()
    new Noty({
            theme : 'metroui',
            type : 'info',
            layout : 'topRight',
            text : message['ERR_MSG'],
            timeout : 5000,
            progressBar :true
        }).show()
    }
})
//vote response notifikaicja
socket.on('voteKickCounterResponse',message=>{
    if(message['Success'])
    new Noty({
            theme : 'metroui',
            type : 'success',
            layout : 'topRight',
            text : message['MSG'],
            timeout : 5000,
            progressBar :true
        }).show()
    else
    new Noty({
            theme : 'metroui',
            type : 'error',
            layout : 'topRight',
            text : message['ERR_MSG'],
            timeout : 5000,
            progressBar :true
        }).show()
})
//glavni load listter
//prikazuje sve podatke potrebne
socket.on('load', message =>{
    if(message['Success']){
    
    $('#maxDiv').show()
    disableAllPButtons()
    sessionToken = localStorage.getItem('sessionToken')
    document.getElementById('localPlayer').textContent = username
    localStorage.setItem("roomCode",roomCode)
    localStorage.setItem("username",username)   
    document.getElementById('lblRoomCode').textContent += String(roomCode)
    lblPlayersReady.textContent = message['playersReady']
    lblPlayerCount.textContent = message['playerCount']
    roundNumber = message['roundNumber']
    lblRoundNumber.textContent = roundNumber
    vreme = message['vreme']
    timer.textContent = String(vreme);
    for(let i =1;i<=roundNumber;i++){
        let opt = document.createElement('option');
        opt.appendChild(document.createTextNode(i))
        opt.value = i
        select.appendChild(opt)
        if(i == roundNumber)
        opt.selected = 'selected'
    }
    points = message['points']
    lblPoeni.textContent = String(message['points'])
    pList[username] = points
    pListKeys = Object.keys(pList)
    new Noty({
            theme : 'metroui',
            type : 'success',
            layout : 'topRight',
            text : message['MSG'],
            timeout : 5000,
            progressBar :true
        }).show()
    if(message['roundActive']){  
        readyBtn.disabled = true;
        disableAllInputFields()
        gameStarted = true;
        new Noty({
            theme : 'metroui',
            type : 'info',
            layout : 'topRight',
            text : 'Sačekajte sledecu rundu da bi ste nastavili da igrate!',
            timeout : 5000,
            progressBar :true
        }).show()
    }
    }else{
    $('#maxDiv').hide()
    new Noty({  
            theme : 'metroui',
            type : 'warning',
            layout : 'topRight',
            text : message['ERR_MSG'],
            timeout : 5000,
            progressBar :true
        }).show()
    }

})  
//ako soba ne postoji response ako je if(room in localData) tacan
socket.on("roomNotExist",message =>{
    new Noty({  
            theme : 'metroui',
            type : 'warning',
            layout : 'topRight',
            text : message,
            timeout : 5000,
            progressBar :true
        }).show()
    $("#maxDiv").hide()
    setTimeout(()=>{location.href = "/"},4000)
})
//updatavnje igraca nakon kikovanja
socket.on('playerCountUpdate', message =>{
    
    lblPlayersReady.textContent = message
})
//error tokom kreiranja runde
socket.on('createRoundResponse',message =>{
    gameStarted = false
    ready = false
    readyBtn.style.backgroundColor = 'red'
    lblPlayersReady.textContent = '0'
    readyBtn.textContent = 'Nisi spreman!' 
    new Noty({
        theme : 'metroui',
        type : 'error',
        layout : 'topRight',
        text : message['ERR_MSG'],
        timeout : 5000,
        progressBar :true
        }).show()
        
})
// response ako bude problema tokom evaluacije
socket.on('evaluationResponse',message=>{
    new Noty({
        theme : 'metroui',
        type : 'success',
        layout : 'topRight',
        text : message['ERR_MSG'],
        timeout : 5000,
        progressBar :true
        }).show()
        roundNumber = message['roundNumber']
        
        let opt = document.createElement('option')
        opt.appendChild(document.createTextNode(roundNumber))
        opt.value = roundNumber
        opt.selected = 'selected'
        select.appendChild(opt)
        lblRoundNumber.textContent = roundNumber
        lblPlayersReady.textContent = message['playersReady']
})
//response ako bude problema u datacolleturu lose napravljeno
socket.on('dataCollectorResponse',message=>{
    new Noty({
        theme : 'metroui',
        type : 'success',
        layout : 'topRight',
        text : message['ERR_MSG'],
        timeout : 5000,
        progressBar :true
        }).show()
})
//event za pocinjane runde 
// ovde se desava disablujenje odredjenih funckija 
// odredjivanje regexa
socket.on('gameStartNotification', message => {
    
    if(message['Success'] == true){
    if(sessionToken == localStorage.getItem('sessionToken'))
    {
        new Noty({
            theme : 'metroui',
            type : 'success',
            layout : 'topRight',
            text : "Svi su spremni , runda počinje",
            timeout : 5000,
            progressBar :true
        }).show()
        lblPlayersReady.textContent = 0
        
        currentLetter = message['currentLetter']
        cirilicaLetter = message['cirilicaLetter'] 
        document.getElementById('currentLetter').textContent = currentLetter   
        let duration = vreme
        myInterval = setInterval(()=>{
        duration--
        timer.innerHTML = duration
        if(duration == 0){
            hideAllHelp()
            readyBtn.disabled = true;
            new Noty({
            theme : 'metroui',
            type : 'success',
            layout : 'topRight',
            text : "Runda završena, evaluacija počinje!",
            timeout : 5000,
            progressBar :true
            }).show()
        
        
            var data = []           
            for(let i=0;i<fields.length;i++){
            if(!dataReg.test($(`#input${fields[i]}`).val().toLowerCase())){
                data.push('')               
            }else{
                data.push($(`#input${fields[i]}`).val().toLowerCase().trim())
            }              
            dataReg.lastIndex =0;       
            }           
            if(!kicked)
                socket.emit('roundData',({username,roomCode,data,roundNumber}))
            historyData[username][roundNumber] = data           
            disableAllInputFields()
            gameStarted = false
            ready = false
            readyBtn.style.backgroundColor = 'red'
            readyBtn.textContent = 'Nisi spreman!'           
            timer.textContent = '0'   
            clearInterval(myInterval)
        }
        },1000)
        readyBtn.innerText = "Gotovo";
        gameStarted = true;
        ready =false;
        hideAllHelp()
        disableAllPButtons()
        disableHistoryReq()
        currentLetter = message['currentLetter']
        cirilicaLetter = message['cirilicaLetter'] 
        document.getElementById('currentLetter').textContent = currentLetter     
        if(currentLetter == "ć")
            dataReg = new RegExp(`^(c|ć|ћ)[A-Za-zа-шА-ШčČćĆžŽšŠđĐђјљњћџЂЈЉЊЋЏ ]{1,41}$`,'g')
        else if(currentLetter == "č")
            dataReg = new RegExp(`^(c|č|ч)[A-Za-zа-шА-ШčČćĆžŽšŠđĐђјљњћџЂЈЉЊЋЏ ]{1,41}$`,'g')
        else if(currentLetter == "lj" || currentLetter == "nj")
            dataReg = new RegExp(`^(${currentLetter}|${cirilicaLetter})[A-Za-zа-шА-ШčČćĆžŽšŠđĐђјљњћџЂЈЉЊЋЏ ]{1,40}$`,'g')
        else if(currentLetter == "dž")
            dataReg = new RegExp(`^(dz|dž|џ)[A-Za-zа-шА-ШčČćĆžŽšŠđĐђјљњћџЂЈЉЊЋЏ ]{1,40}$`,'g')
        else if(currentLetter == "đ")
            dataReg = new RegExp(`^(đ|dj|ђ)[A-Za-zа-шА-ШčČćĆžŽšŠđĐђјљњћџЂЈЉЊЋЏ ]{1,40}$`,'g') 
        else if(currentLetter == "ž")
            dataReg = new RegExp(`^(z|ž|ж)[A-Za-zа-шА-ШčČćĆžŽšŠđĐђјљњћџЂЈЉЊЋЏ ]{1,41}$`,'g')
        else if(currentLetter == "š")
            dataReg = new RegExp(`^(s|š|ш)[A-Za-zа-шА-ШčČćĆžŽšŠđĐђјљњћџЂЈЉЊЋЏ ]{1,41}$`,'g')
        else
            dataReg = new RegExp(`^(${currentLetter}|${cirilicaLetter})[A-Za-zа-шА-ШčČćĆžŽšŠđĐђјљњћџЂЈЉЊЋЏ ]{1,41}$`,'g')
        
        enableAllInputFields()
        clearAllInputFields()
    }
    else{
        disableAllInputFields();
        disableAllPButtons();
        readyBtn.disabled = true;
        
        //daj ovde neki notifikation
        new Noty({
            theme : 'metroui',
            type : 'error',
            layout : 'topRight',
            text : "Mozete biti samo u jednoj sobi u isto vreme.",
            timeout : 4000,
            progressBar :true
        }).show()
        setTimeout(()=>{
        location.href = "/"
        },4000)
        
    }
    }else{
    //game unable to start
    }
    
})

socket.on('playerLeft',message=>{
    if(message != username)
    new Noty({
        theme : 'metroui',
            type : 'info',
            layout : 'topRight',
            text : message,
            timeout : 4000,
            progressBar :true
    }).show()
})
socket.on('playerList',message=>{
    //ovde treba da se reqestaju poeni takodje..
    if(message["MODE"]== "START"){
    let keys = Object.keys(message['players'])
    for(let i =0;i<keys.length;i++){
        if(!(keys[i] in pList))
        {
        pList[keys[i]] = message['players'][keys[i]]               
        $("ul").append(`<li id="${keys[i]}"><label class="nameLabel" onclick="historyReq('${keys[i]}')">${keys[i]}</label> | <label id="${keys[i]}Points">${message['players'][keys[i]]}</label> <span onclick="voteKick(\'${keys[i]}\')" class="mySpan" id="span${keys[i]}">&#10006;</span></li>`);
        }
    }
    pListKeys = Object.keys(pList)
        if(gameStarted){
            disableAllPButtons()
            disableHistoryReq()
            disableKick()
        }
    }else if(message["MODE"] == "UPDATE"){
    let keys = Object.keys(message['players'])
    // ovde prvoeri da li postoji uPlisti etc i uzimaj value iz pliste a ne sa htmla
    
    for(let i =0;i<keys.length;i++){
        try{
        if(keys[i] in pList) {
            pList[keys[i]] += message['players'][keys[i]]
            document.getElementById(keys[i]+'Points').textContent = pList[keys[i]]
            }
        }
        catch(TypeError){

        }
    } 
    }
})
//funckicja za glasanje
function voteKick(usernameM){
    socket.emit('voteKickStart',({usernameM,roomCode}))
    //na result eventu enabluj
    
    disableKick()
    
}
//start vote kick event prikazuje popup za glasanje za izbacivanje
socket.on('startVoteKickResponse',message=>{
    if(message['Success']){
    myAlert(message['username'])
    
    disableKick()
    new Noty({
        theme : 'metroui',
        type : 'info',
        layout : 'topRight',
        text : message['MSG'],
        timeout : 3000,
        progressBar :true
        }).show()
    }
    else
    {
    new Noty({
        theme : 'metroui',
        type : 'info',
        layout : 'topRight',
        text : message['ERR_MSG'],
        timeout : 5000,
        progressBar :true
        }).show()
    }
})
//player ready response
socket.on('playerReadyResponse' , message =>{
    
    if(message['Success'] == false){
    if(message['ERR_CODE'] == 1){
        //reset ready button
        readyBtn.style.backgroundColor = 'red'
        readyBtn.textContent = "Nisi spreman!"
        lblPlayersReady.textContent = 0
        new Noty({
        theme : 'metroui',
        type : 'error',
        layout : 'topRight',
        text : message['ERR_MSG'],
        timeout : 5000,
        progressBar :true
        }).show()
    }
    }
    else{
    if(message['CODE'] == 1)
    {
        if(message['STATE'] == 'Spreman'){
        readyBtn.style.backgroundColor = 'green';               
        }else{
        readyBtn.style.backgroundColor = 'red';               
        }
        readyBtn.textContent = message['STATE']
        new Noty({
        theme : 'metroui',
        type : 'success',
        layout : 'topRight',
        text : message['MSG'],
        timeout : 5000,
        progressBar :true
        }).show()
    }
    }
    readyBtn.disabled = false;
})
//player disc messsage event
/*
socket.on('discMessage',message =>{
    new Noty({
        theme : 'metroui',
        type : 'info',
        layout : 'topRight',
        text : message,
        timeout : 5000,
        progressBar :true
    }).show()
})*/
//playerjoin event ispis
socket.on('playerJoinMsg', message =>{    
    
    new Noty({
        theme : 'metroui',
        type : 'success',
        layout : 'topRight',
        text : message,
        timeout : 5000,
        progressBar :true
    }).show()
})

//points socket listener event gde se dodaju poeni 
socket.on('points' , message =>{         
    readyBtn.disabled = false;
    if(!message['Success'])
    {
    new Noty({
        theme : 'metroui',
        type : 'error',
        layout : 'topRight',
        text : 'Problem prilikom evaluacije, runda ponistena',
        timeout : 5000,
        progressBar :true
        }).show()
    
    }
    else
    {
    enableHistoryReq()
    enableKick()
    new Noty({
        theme : 'metroui',
        type : 'success',
        layout : 'topRight',
        text : 'Evaluacija zavrsena',
        timeout : 5000,
        progressBar :true
        }).show()  
        for(let i=0;i<fields.length;i++){
        try
        {                  
            poeni = message['result'][i][$(`#input${fields[i]}`).val().toLowerCase()]
            if(poeni != undefined){
            document.getElementById(`input${fields[i]}`).value += '  + ' +  poeni
            points += Number(poeni)
            }
            else{
            if(document.getElementById(`input${fields[i]}`).value != "")
                $(`#predloziBtn${fields[i]}`).prop("disabled", false)
            document.getElementById(`input${fields[i]}`).value += '  + 0'                                       
            }
        }
        catch(TypeError){
            
            if(document.getElementById(`input${fields[i]}`).value != "")
            $(`#predloziBtn${fields[i]}`).prop("disabled", false)
            document.getElementById(`input${fields[i]}`).value += '  + 0'                  
        }
        }
        
        lblPoeni.textContent = String(points)
    }
    roundNumber = message['roundNumber']
    select = document.getElementById('roundSelect')
    let opt = document.createElement('option')
    opt.appendChild(document.createTextNode(roundNumber))
    opt.value = roundNumber
    opt.selected = 'selected'
    select.appendChild(opt)
    lblRoundNumber.textContent = roundNumber
    lblPlayersReady.textContent = message['playersReady']          
})
//err listner
socket.on('pointsErr',message=>{
    new Noty({
        theme : 'metroui',
        type : 'success',
        layout : 'topRight',
        text : message['ERR_MSG'],
        timeout : 5000,
        progressBar :true
    }).show()
    setTimeout(()=>{location.reload()},1500)
    $('#maxDiv').hide()
    
})
//socket listener za kraj runde od strane servera nakon isteka vremen   a ili nakon sto je neki drugi igrac zavrsio
socket.on('roundEnd',message =>{
    
   
    hideAllHelp()
    readyBtn.disabled = true;
    if(message['Success']){            
        new Noty({
        theme : 'metroui',
        type : 'success',
        layout : 'topRight',
        text : message['MSG'],
        timeout : 5000,
        progressBar :true
        }).show()
        
        
        var data = []           
        for(let i=0;i<fields.length;i++){
        if(!dataReg.test($(`#input${fields[i]}`).val().toLowerCase())){
            data.push('')               
        }else{
            data.push($(`#input${fields[i]}`).val().toLowerCase().trim())
        }              
        dataReg.lastIndex =0;       
        }           
        if(!kicked)
            socket.emit('roundData',({username,roomCode,data,roundNumber}))
        historyData[username][roundNumber] = data           
        disableAllInputFields()
        gameStarted = false
        ready = false
        readyBtn.style.backgroundColor = 'red'
        readyBtn.textContent = 'Nisi spreman!'           
        clearInterval(myInterval)
        timer.textContent = '0'
    }
    
})    
//ready button click event listner // sluzi za ready upovanje i slanje zahteva za kraj runde ako su sva polja validno popunjena
readyBtn.addEventListener('click',(e) =>{
    if(!gameStarted){
    if(!ready){
        socket.emit('playerReady',roomCode)
        readyBtn.disabled = true;
        ready = true
    }
    else{
        socket.emit('playerUnReady',roomCode)            
        readyBtn.disabled = true;
        ready = false
    }
    }else{
    
    data =[]
    hideAllHelp()
    var allValid = true
    for(let i=0;i<fields.length;i++){
        if(!dataReg.test($(`#input${fields[i]}`).val().toLowerCase())){
        $(`#help${fields[i]}`).show() 
        allValid = false
        data.push('')
        
        }else{
        data.push($(`#input${fields[i]}`).val().toLowerCase().trim())
        }
        dataReg.lastIndex = 0             
    }
    if(allValid){
        readyBtn.disabled = true;     
        if(!kicked){
        socket.emit('clientEndRound',({username,roomCode,data,roundNumber}))
        }
        historyData[username][roundNumber] = data
        disableAllInputFields()
        gameStarted = false
        ready = false
        readyBtn.style.backgroundColor = 'red'
        readyBtn.textContent = 'Nisi spreman'             
        clearInterval(myInterval)
        timer.textContent = '0'
    }
    }
})

//windows on load event gde se regexuju podaci radi zastite i salje zahtev za ulazak u sobu
window.onload = (e)=>{
    const {username, roomCode} = Qs.parse(location.search,{
        ignoreQueryPrefix: true
    })
    let roomReg = /^[A-Za-z0-9]{8}$/g
    const usernameReg = /^[A-Za-zа-шА-ШčČćĆžŽšŠđĐђјљњћџЂЈЉЊЋЏ ]{4,16}$/g
    const sessionReg = /^[A-Za-z0-9/+]{48}$/g
    if(roomReg.test(roomCode) && usernameReg.test(username)){
        const sessionToken = localStorage.getItem('sessionToken') 
        if(sessionReg.test(sessionToken))
            socket.emit('joinRoomReq',({username,roomCode,sessionToken}))
        else
            new Noty({
            theme : 'metroui',
            type : 'error',
            layout : 'topRight',
            text : "Session token nije validan!",
            timeout : 5000,
            progressBar :true
            }).show()

    }
    else{
            new Noty({
            theme : 'metroui',
            type : 'error',
            layout : 'topRight',
            text : "Format sobe ili korisnickog imena nisu validni!",
            timeout : 5000,
            progressBar :true
        }).show()

    }
}
//Funkcija za predlaganje odgovora
function predlozi(field){          
    let val = $(`#input${field}`).val().toLowerCase().split('+')[0].trim()          
    if(dataReg.test(val)){
    let k = kDict[field]
    socket.emit("predlagac",({val,currentLetter,k}));                      
    new Noty({
            theme : 'metroui',
            type : 'success',
            layout : 'topRight',
            text : "Vas odgovor je uspesno predložen!",
            timeout : 5000,
            progressBar :true
        }).show()
    }
    else{
    $(`#help${field}`).show()
    }
    dataReg.lastIndex = 0;
    document.getElementById(`predloziBtn${field}`).disabled = true;
}