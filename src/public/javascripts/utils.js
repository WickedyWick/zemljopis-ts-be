const perf = require('perf_hooks')
const e = require('express')
var pool = require('./trueMysql.js')
const { strict } = require('assert') //ne znam sta je ovo 
require('dotenv').config({path: __dirname + '../.env'})
const letterDict = {            
    'a':'а',
    'b':'б',
    'v':'в',
    'g':'г',
    'd':'д',
    'đ':'ђ',
    'e':'е',
    'ž':'ж',
    'z':'з',
    'i':'и',
    'j':'ј',
    'k':'к',
    'l':'л',
    'lj':'љ',
    'm':'м',
    'n':'н',
    'nj':'њ',
    'o':'о',
    'p':'п',
    'r':'р',
    's':'с',
    't':'т',
    'ć':'ћ',
    'u':'у',
    'f':'ф',
    'h':'х',
    'c':'ц',
    'č':'ч',
    'dž':'џ',
    'š':'ш',
}
/*******
    if(room in localData) se proverava u slucaju da se srusi aplikacija i da nekako user posalje request ili ako korisnik ostane u sobi dugo (ostavi tab otvoreen) i pokusa da nastavi da igra a soba vise nije aktivna
    sobe ce biti aktivne 6 sati
    i svakih 6 sati ce idi taskscheduled cleaner starih soba
*/
function playerReady(room,localData,socket,io,sockets){
    if(room in localData){
        if(localData[room]['playersReady'] < localData[room]['playerCount'])
        {
            io.to(room).emit('playerCountUpdate',localData[room]['playersReady'] += 1)
            try{
                sockets[socket.id]['ready'] = true
            }catch(err){
                console.error(`[${new Date()}] Error while readying the socket\nErr : ${err}\n\tSockets : ${sockets}`)   
                io.to(process.env.REG_KEY).emit("notification",{"msg":"SOCKETS READY ERR"
                    ,"line":52
                    ,"file":"utils"
                })    

            }
            if(localData[room]['playersReady'] == localData[room]['playerCount']){               
                socket.emit('playerReadyResponse',{'Success' : true,
                    "MSG" : "Uspeh!",
                    "STATE" : "Spreman",
                    "CODE" : 1                    
                })                
                createRound(room,io,localData,sockets)
            }
            else
                socket.emit('playerReadyResponse',{'Success' : true,
                    "MSG" : "Uspeh!" ,
                    "STATE" : "Spreman",
                    "CODE" : 1
            })           
        }   
        else
        {
            console.error(`[${new Date()}] Invalid player ready number`)
            io.to(process.env.REG_KEY).emit("notification",{"msg":"PLAYER READY INVALID NUMBER"
                ,"line":76
                ,"file":"utils"
            }) 
            localData[room]['playersReady'] = 0
            io.to(room).broadcast.emit('playerReadyResponse',{'Success' : false,
                "ERR_MSG" : `Problem! Svi u sobi NISU spremni ponovo!`,
                "ERR_CODE" : 1
            })
        }
    }else{
        socket.emit("roomNotExist","Soba više ne postoji , kreirajte novu!");
    }
}
function historyReq(room,username,round,localData,socket){  
    if(room in localData){
        if(round in localData[room]['roundIDS']){ //
            pool.query(`Select drzava, grad, ime, biljka, zivotinja, planina, reka, predmet from data where roundID = ${localData[room]['roundIDS'][round]} and playerID = ${localData[room]['players'][username]}`,(err,results,fields)=>{
                if(err){
                    console.error(`[${new Date()}] THERE WAS AN ERROR WHILE SELECTING HISTORY:\nCODE : ${err.code}\nMSG : ${err.sqlMessage}\n\nRoom : ${room}\n\tRound : ${round}\n\tUsername : ${username}`)
                    io.to(process.env.REG_KEY).emit("notification",{"msg":"DB SELECT ERR"
                        ,"line":96
                        ,"file":"utils"
                    }) 
                    socket.emit("historyReqResponse",{"Success":false,
                        "ERR_MSG":"Došlo je do problema prilikom prikazivanja traženih podataka!"
                    })
                }else{                    
                    if(results.length==0){
                        socket.emit("historyReqResponse",{"Success":false,
                            "ERR_MSG": "Nema traženih podataka!"
                        })
                    }else{
                        socket.emit("historyReqResponse",{"Success":true,
                            "Data" : results[0],
                            "MSG" : "Podaci pronadjeni!",
                            "username" :username,
                            "round":round
                        })
                    }
                }
            })
        }else{
            socket.emit("historyReqResponse",{"Success":false,
                "ERR_MSG" : "Runda još nije odigrana"
            })
            console.error(`[${new Date()}] ROUND DOESNT EXITST?!\n\tRound : ${round}`)
            io.to(process.env.REG_KEY).emit("notification",{"msg":"ROUND DOESNT EXIST"
                ,"line":123
                ,"file":"utils"
            }) 
        }
    }else{
        socket.emit('roomNotExist',"Soba više ne postoji, kreirajte novu!")
    }
}
function createRound(room,io,localData,sockets){
    //console.log(room)
    if(room in localData){
        pool.getConnection((err,connection) =>{
            if(err){
                console.log(`ERROR CONNECTING TO THE DATABASE RUDING CREATING ROUND : Code ${err.code}\nMSG : ${err.sqlMessage}`)           
            }else{
                chooseLetter(room,localData).then((response)=>{
                    connection.query('insert into round values(DEFAULT,?,?,?)',[localData[room]['roundNumber'],room,response],(err,results,fields)=>{
                        if(err){
                            console.error(`[${new Date()}] ERROR CREATING ROUND : Code ${err.code}\nMSG : ${err.sqlMessage}\n\tRoom : ${room}\n\tResponse : ${response}`)  
                            io.to(process.env.REG_KEY).emit("notification",{"msg":"DB INSERT ERR"
                                ,"line":142
                                ,"file":"utils"
                            })                            
                            io.to(room).emit('createRoundResponse',{
                                "ERR_MSG" : "Problem pri kreiranju runde , pokusajte ponovo!"
                            })
                            localData[room]['playersReady'] = 0
                        }else{                     
                            localData[room]['roundActive'] = true
                            localData[room]['roundIDS'][localData[room]['roundNumber']] = results.insertId
                            localData[room]['roundID'] = results.insertId
                            localData[room]['playersReady'] = 0
                            io.to(room).emit("gameStartNotification",{'Success' : true,                                     
                                        "currentLetter":response,
                                        "cirilicaLetter": letterDict[response],
                                        "CODE" : 1
                                    })                                   
                            
                            
                            const temp = setTimeout(timeout, localData[room]['roundTimeLimit']*1000, room,localData,io);                           
                            //var temp = setTimeout(timeout,,room,localData,io)
                            localData[room]['intervalObj'] = temp                                
                            let keys = Object.keys(io.sockets.adapter.rooms[room]['sockets'])
                            for(let i=0;i<keys.length;i++){
                                sockets[keys[i]]['ready'] = false;
                            }
                        }
                        
                    })                    
                },reject =>{
                    io.to(room).emit('createRoomResponse',{
                        "ERR_MSG" : "Kraj igre, sva slova su iskorišćena!"
                    })
                })
            }
            connection.release()
        })
    }else
    socket.emit('roomNotExist',"Soba više ne postoji , kreirajte novu!")
}

function chooseLetter(room,localData){    
    return new Promise((resolve,reject)=>{ 
        letter = (localData[room]['availableLetters'][Math.floor(Math.random() * localData[room]['availableLetters'].length)])
        let index = localData[room]['availableLetters'].indexOf(letter)
        if(index !== -1){
            localData[room]['availableLetters'].splice(index,1)
            localData[room]['currentLetter'] = letter
            resolve(letter)
        }
        reject("Nema više slova, kraj igre!")              
    })
}

function playerUnReady(room,localData,socket,io,mode,sockets){
    
    if(room in localData){
        if(localData[room]['playersReady'] > 0 && localData[room]['playersReady'] <= localData[room]['playerCount']){
            io.to(room).emit('playerCountUpdate',localData[room]['playersReady'] -= 1)
            try{
                sockets[socket.id]['ready'] = false
            }catch(err){
                io.to(process.env.REG_KEY).emit("notification",{"msg":"SOCKETS UNREADY ERR"
                    ,"line":206
                    ,"file":"utils"
                })   
                console.error(`[${new Date()}] Error while unreadying the socket\nErr : ${err}`)   
            }
            if(mode == "BTN")
                socket.emit('playerReadyResponse',{'Success' : true,
                        "MSG" : "Uspeh!" ,
                        "STATE" : "Nisi spreman",
                        "CODE" : 1
                })
            else if(mode == "DISC")
                delete sockets[socket.id]        
        }
        else
        {
            console.error(`[${new Date()}] Invalid player ready number`)
            io.to(process.env.REG_KEY).emit("notification",{"msg":"PLAYER UNREADY INVALID NUMBER"
                ,"line":224
                ,"file":"utils"
            })
            localData[room]['playersReady'] = 0
            io.to(room).emit('playerReadyResponse',{'Success' : false,
                "ERR_MSG" : `Problem! Svi u sobi NISU spremni ponovo!`,
                "ERR_CODE" : 1
            })
        }
    }else
    socket.emit('roomNotExist',"Soba više ne postoji , kreirajte novu!")
}
fieldKeys = ['drzava','grad','ime','biljka','zivotinja','planina','reka','predmet']
function evaluation(room,localData,io){
    if(room in localData){
        try{
            if(localData[room]['roundActive']){
                clearTimeout(localData[room]['intervalObj'])
                localData[room]['evalFuncExecuting'] = true;
                localData[room]['roundActive'] = false  
                localData[room]['playersReady'] = 0
                localData[room]['roundNumber']+=1
                
                pool.getConnection((err,connection)=>{
                //ovi ifovi u slucaju da se se nekako evaluation funkcije u isto vreme pozovu
                    if(err)
                    {
                        console.error(`[${new Date()}] Doslo je do problema prilikom povezivanja na bazu podataka u evaluaciji! CODE : ${err.code} MSG : ${err.sqlMessage}\n\tRoom : ${room}\n\tLocalData : ${localData[room]}`)                   
                        io.to(process.env.REG_KEY).emit("notification",{"msg":"DB CONNECT ERR"
                            ,"line":253
                            ,"file":"utils"
                        })
                        io.to(room).emit("evaluationResponse",{
                            "ERR_MSG" : "Doslo je problema prilikom evaluacije , runda ponistena!",
                            "roundNumber" : localData[room]['roundNumber'],
                            'playersReady': localData[room]['playersReady']
                        })
                        localData[room]['evalFuncExecuting'] = false;
                    }
                    else{
                        dataKeys = Object.keys(localData[room]['data'])
                        myDict = {  }
                        ids = {}
                        sql = `select naziv , kategorija ,oDataID from referencedata where slovo ='${localData[room]['currentLetter']   }' and (naziv`
                        for(let i =0;i < dataKeys.length;i++){
                            dataRow = localData[room]['data'][dataKeys[i]];
                            for(let j=0;j<dataRow.length;j++){
                                nazivPodatka = dataRow[j]
                                
                                if(nazivPodatka in myDict){
                                    if(j in myDict[nazivPodatka])
                                    {
                                        myDict[nazivPodatka][j]['count'] +=1
                                        myDict[nazivPodatka][j]['ids'].push(dataKeys[i])
                                        
                                    }
                                    else
                                    {
                                        myDict[nazivPodatka][j] = {}
                                        myDict[nazivPodatka][j]['count'] =1
                                        myDict[nazivPodatka][j]['ids'] = [dataKeys[i]]
                                    }
                                    
                                }else{
                                    myDict[nazivPodatka] ={}
                                    myDict[nazivPodatka][j] = {}
                                    myDict[nazivPodatka][j]['count'] =1
                                    myDict[nazivPodatka][j]['ids'] = [dataKeys[i]]
                                    sql+= '=? or naziv'
                                }
                            }
                            ids[dataKeys[i]] = 0
                        }
                        sql+= "='x')"
                    
                        naziviKeys = Object.keys(myDict)
                        otherDict = {}
                        connection.query(sql,naziviKeys,(err1,results,fields)=>{
                            /*  ovako results izlgeda
                                RowDataPacket { naziv: 'apatin', kategorija: 1, oDataID: 2701 },
                                RowDataPacket { naziv: 'alžir', kategorija: 1, oDataID: 2703 },
                                RowDataPacket { naziv: 'alzir', kategorija: 1, oDataID: 2703 },
                                RowDataPacket { naziv: 'aleksinac', kategorija: 1, oDataID: 2744 },
                                RowDataPacket { naziv: 'ada', kategorija: 1, oDataID: 2745 },
                                RowDataPacket { naziv: 'arilje', kategorija: 1, oDataID: 2748 },
                                RowDataPacket { naziv: 'adorjan', kategorija: 1, oDataID: 2753 },
                                RowDataPacket { naziv: 'aleksandrovo', kategorija: 1, oDataID: 2760 },
                                RowDataPacket { naziv: 'avganistan', kategorija: 0, oDataID: 5397 },
                                RowDataPacket { naziv: 'alžir', kategorija: 0, oDataID: 5400 },
                                RowDataPacket { naziv: 'alzir', kategorija: 0, oDataID: 5400 },
                                RowDataPacket { naziv: 'andora', kategorija: 0, oDataID: 5402 },
                                RowDataPacket { naziv: 'argentina', kategorija: 0, oDataID: 5404 },
                                RowDataPacket { naziv: 'australija', kategorija: 0, oDataID: 5405 },
                                RowDataPacket { naziv: 'austrija', kategorija: 0, oDataID: 5406 },
                                RowDataPacket { naziv: 'avala', kategorija: 5, oDataID: 5614 },
                                RowDataPacket { naziv: 'arnauta', kategorija: 6, oDataID: 5910 },
                                RowDataPacket { naziv: 'amazon', kategorija: 6, oDataID: 5913 },
                                RowDataPacket { naziv: 'ada', kategorija: 6, oDataID: 5922 },
                                RowDataPacket { naziv: 'ana', kategorija: 6, oDataID: 5925 },
                                RowDataPacket { naziv: 'artičoka', kategorija: 3, oDataID: 6295 },
                                RowDataPacket { naziv: 'ananas', kategorija: 3, oDataID: 6297 },
                                RowDataPacket { naziv: 'aronija', kategorija: 3, oDataID: 6298 },
                                RowDataPacket { naziv: 'anakonda', kategorija: 4, oDataID: 6762 },
                                RowDataPacket { naziv: 'aleksa', kategorija: 2, oDataID: 7188 },
                                RowDataPacket { naziv: 'aleksandar', kategorija: 2, oDataID: 7189 },
                                RowDataPacket { naziv: 'aleksej', kategorija: 2, oDataID: 7191 },
                                RowDataPacket { naziv: 'aleksandra', kategorija: 2, oDataID: 7212 },
                                RowDataPacket { naziv: 'ana', kategorija: 2, oDataID: 7214 },
                                RowDataPacket { naziv: 'anastasija', kategorija: 2, oDataID: 7215 }
                            */
                            
                            if(err1){
                                console.error(`[${new Date()}] Doslo je do problema prilikom selektovanja podataka u evaluaciji! CODE : ${err1.code} MSG : ${err1.sqlMessage}\n\tSQL : ${sql}`)
                                io.to(process.env.REG_KEY).emit("notification",{"msg":"DB SELECT ERR"
                                    ,"line":338
                                    ,"file":"utils"
                                })
                                io.to(room).emit("evaluationResponse",{
                                    "ERR_MSG" : "Doslo je problema prilikom evaluacije , runda ponistena!",
                                    "roundNumber" : localData[room]['roundNumber'],
                                    'playersReady': localData[room]['playersReady']
                                })
                                localData[room]['evalFuncExecuting'] = false;
                            }
                            else{
                                for(let i =0;i<results.length;i++){
                                    oDataID = results[i]['oDataID']
                                    kategorija = results[i]['kategorija']
                                    naziv = results[i]['naziv']                              
                                    if(naziv in myDict && kategorija in myDict[naziv]){
                                        if(oDataID in otherDict){
                                            otherDict[oDataID]['nazivi'].push(naziv)
                                            otherDict[oDataID]['points'] = 5
                                            otherDict[oDataID]['count'] += myDict[naziv][kategorija]['count']
                                            
                                        }else{
                                        otherDict[oDataID] = {}
                                        otherDict[oDataID]['nazivi'] = [naziv]
                                        otherDict[oDataID]['count'] = myDict[naziv][kategorija]['count']
                                        otherDict[oDataID]['kategorija'] = kategorija
                                        //overwrite myDict
                                        if(otherDict[oDataID]['count'] > 1)
                                        {
                                            for(let j=0;j<myDict[naziv][kategorija]['ids'].length;j++)
                                                ids[myDict[naziv][kategorija]['ids'][j]] +=5
                                            otherDict[oDataID]['points'] = 5
                                        }
                                        else
                                        {
                                            for(let j=0;j<myDict[naziv][kategorija]['ids'].length;j++)
                                                ids[myDict[naziv][kategorija]['ids'][j]] +=10
                                            otherDict[oDataID]['points'] = 10
                                        }   
                                        
                                        }
                                    }
                                }
                                
                                pointsDict = {}
                                pointsDict['result'] = {}
                                pointsDict['Success'] = true
                                pointsDict['roundNumber'] = localData[room]['roundNumber']
                                pointsDict['playersReady'] = localData[room]['playersReady']
                                otherDictKeys = Object.keys(otherDict)
                                /*kategroija{
                                    naziv : poeni
                                }
                                */
                                for(let i =0;i<otherDictKeys.length;i++){
                                    nazivi = otherDict[otherDictKeys[i]]['nazivi']
                                    kategorija = otherDict[otherDictKeys[i]]['kategorija']
                                    poeni = otherDict[otherDictKeys[i]]['points']
                                    if(!(kategorija in pointsDict['result']))
                                        pointsDict['result'][kategorija] = {}
                                    for(let j =0;j<nazivi.length;j++)
                                        pointsDict['result'][kategorija][nazivi[j]] = poeni
                                }

                            
                                //console.log(pointsDict);
                            
                                otherDictKeys = Object.keys(ids)
                                sql = ""
                                io.to(room).emit('points',pointsDict)
                                pointsDict ={}
                                names = localData[room]['playersID']
                                
                                for(let i =0;i<otherDictKeys.length;i++){
                                    sql += `Update data set bodovi = ${ids[otherDictKeys[i]]} where playerID = ${otherDictKeys[i]} and roundID = ${localData[room]['roundID']};`
                                    pointsDict[names[otherDictKeys[i]]] = ids[otherDictKeys[i]]
                                }
                                //console.log(ids);
                                io.to(room).emit("playerList",{'players':pointsDict,
                                            "MODE" : "UPDATE"
                                        })
                                localData[room]['evalFuncExecuting'] = false;
                                if(sql != "")
                                    connection.query(sql,(err,results,fields)=>{
                                        //Ne moram da cekam da se ovo zavrsi da bih poslao rezultate , ako ovde ima problem posaljem page refresh req tako da ce se refresovati stranica sama i poeni ce ostati kako treba
                                        if(err)
                                        {
                                            
                                            console.error(`[${new Date()}] Problem upisivanje bodova u bazu! MSG : Code : ${err.code}\nMSG: ${err.sqlMessage}\n\tSQL : ${sql}`)
                                            io.to(process.env.REG_KEY).emit("notification",{"msg":"DB INSERT ERR"
                                                ,"line":428
                                                ,"file":"utils"
                                            })
                                            io.to(room).emit('pointsErr',{"ERR_MSG":"Doslo je do problema sa upisivanjem bodova , poeni u rundi su nevazeći!"})
                                        }
                                        
                                    })                                
                                localData[room]['data'] ={}                                        
                            }
                        })
                    }
                    connection.release();
                })
            }
        }catch(err){
            console.error(`[${new Date()} ERROR DURING EVALUATION\n\tERR : ${err}`)    
            io.to(process.env.REG_KEY).emit("notification",{"msg":"EVAL ERROR"
                ,"line":445
                ,"file":"utils"
            })    
            io.to(room).emit('points',{
                'Success':false,
                'roundNumber' : localData[room]['roundNumber'],
                'playersReady':localData[room]['playersReady']
            })
            localData[room]['data'] ={}
            localData[room]['evalFuncExecuting'] = false;
        }
    }else
    socket.emit('roomNotExist',"Soba više ne postoji , kreirajte novu!")    
}

function dataCollector(io,username,room,data,round,localData,socket){   
        if(room in localData){
            if(localData[room]['data'][localData[room]['players'][username]] === undefined && round == localData[room]['roundNumber']){                  
                pool.query(`insert into data values(DEFAULT,${localData[room]['roundID']},${localData[room]['players'][username]},?,?,?,?,?,?,?,?,0)`,data,(err,results,fields)=>{
                    if(err){                       
                        console.error(`[${new Date()}] Error while inserting data values : Code : ${err.code}\nMSG: ${err.sqlMessage}\n\tUsername : ${username}\n\tRoom : ${room}\n\tData : ${data}`)
                        io.to(process.env.REG_KEY).emit("notification",{"msg":"DB INSERT ERR"
                            ,"line":467
                            ,"file":"utils"
                        })   
                        socket.to(room).emit("dataCollectorResponse",{
                            "ERR_MSG": "Doslo je do problema prilikom unosenja podataka, podaci nevažeci!"
                        })
                    }else{
                        localData[room]['data'][localData[room]['players'][username]] = data                       
                                console.log(`Data recieved for : ${username} \n${data}`)
                                keys = Object.keys(localData[room]['data'])
                                if(keys.length == localData[room]['playerCount'])
                                    if(localData[room]['roundActive'])
                                    {                                       
                                        evaluation(room,localData,io)
                                    }
                    }
                })                      
            }
        }else
        socket.emit('roomNotExist',"Soba više ne postoji , kreirajte novu!")

}   
function startVoteKick(room,username,localData,socket,io){
    if(room in localData){
        if(!('kickVote' in localData[room])){
            //console.log(`VOTE KICK STARTED FOR : ${username}`)
            localData[room]['kickVote'] = {}
            localData[room]['kickVote']['username'] = username
            localData[room]['kickVote']['for'] = 0
            localData[room]['kickVote']['alreadyVoted'] = []
            localData[room]['kickVote']['totalVotes'] = 0 // duzina alreadyVotedNiza
            localData[room]['kickVote']['timeoutID'] = setTimeout(kickEval,120000,room,localData,io)
            localData[room]['kickVote']['funcCalled'] = false // ovo je za 1% slucajeva kada se potrefi vreme timeouta i votekick countera da se ne bi funkcije 2 puta
            //cuvaj ovaj username na strani da ne bi mogao da glasas za pogresnog igraca nekako
            io.to(room).emit('startVoteKickResponse',{"Success" : true,
                "MSG": `Počelo je glasanje za izbacivanje igrača : ${username}`,                
                "username" : username})
        }else
            socket.emit("startVoteKickResponse",{"Success" : false,
                        "ERR_MSG" : "Glasanje za izbacivanje je već u toku sačekajte da se završi!"
                })
    }else{
        socket.emit("roomNotExist","Soba više ne postoji, kreirajte novu!");
    }
}

function kickEval(room,localData,io){
    try{
        if(!localData[room]['kickVote']['funcCalled'])
        {
            if(!localData[room]['evalFuncExecuting'])
            {
                    localData[room]['kickVote']['funcCalled'] = true
                    if(((localData[room]['kickVote']['for'] / localData[room]['playerCount']) *100 ) > 50){ // procenti
                        username = localData[room]['kickVote']['username']
                        pool.query("update player set kicked =1 where username = ?",[username],(err,results,fields)=>{
                            if(err){
                                console.error(`[${new Date()}] ERROR WHILE KICKING PLAYER : Code : ${err.code}\nMSG : ${err.sqlMessage}\n\tUsername : ${username}\n\tRoom : ${room}`)
                                io.to(process.env.REG_KEY).emit("notification",{"msg":"KICK ERROR"
                                    ,"line":526
                                    ,"file":"utils"
                                })   
                                io.to(room).emit("kickResult",{'Success':false,
                                        "ERR_MSG": "Doslo je do problema prilikom izbacivanja igrača , pokušajte ponovo kasnije!"
                                })
                            }else{
                                
                                localData[room]['playerCount'] -= 1
                                io.to(room).emit("kickResult",{'Success':true,
                                        "username" : username,
                                        "MSG": "Igrač je izabačen!",
                                        "SPEC_MSG" : "Izbačeni ste iz sobe!"
                                })
                                let tempID = localData[room]['players'][username]
                                delete localData[room]['players'][username]
                                delete localData[room]['playersID'][tempID]
                                delete localData[room]['kickVote']
                            }
                        })
                    }else{
                        
                        io.to(room).emit('kickResult',{'Success':false,
                            "ERR_MSG":"Glasanje završeno , nedovoljno glasova za izbacivanje!" 
                        })
                        delete localData[room]['kickVote']
                    }
                }else{
                    setTimeout(kickEval,room,localData,io,4000)
                    console.log("eval exectuing")
                }
                
        }else{
            console.log("Ongoing kick eval")
            //nista se ne desi 
        }
    }catch(TypeError){
        
        io.to(room).emit('kickResult',{'Success':false,
            "ERR_MSG":"Glasanje isteklo!" 
        })
    }
}

function voteKickCounter(room,username,mode,locaData,socket,io){
    if(room in localData){
        if('kickVote' in locaData[room]){           
            if(!localData[room]['kickVote']['alreadyVoted'].includes(username))
            {
                localData[room]['kickVote']['alreadyVoted'].push(username)
                if(mode == "FOR"){
                    localData[room]['kickVote']['for'] += 1
                }
                localData[room]['kickVote']['totalVotes'] +=1
                
                socket.emit("voteKickCounterResponse",{ "Success" : true,
                            "MSG": "Uspešno glasanje!"
                    })
               
                 if(locaData[room]['kickVote']['totalVotes'] == localData[room]['playerCount']){
                    clearTimeout(localData[room]['kickVote']['timeoutID'])
                    kickEval(room,localData,io)
                         
                    
                    //delete localData[room]['kickVote']
                }
            }
            else
            socket.emit("voteKickCounterResponse",{"Success":false,
                "ERR_MSG": "Moguće je glasati samo jednom!"        
            })             
        }else{
            socket.emit("voteKickCounterResponse",{"Success":false,
                    "ERR_MSG":"Glasanje nije u toku"
                
            }) 
        }
    }else
        socket.emit("roomNotExist","Soba više ne postoji, kreirajte novu!");
}
function predlagac(predlog,slovo,kategorija){
   
    pool.query(`insert into predlozi values(DEFAULT,?,?,${kategorija},NOW());`,[predlog,slovo],(err,results,fields)=>{
        if(err){
            
            console.error(`[${new Date()}] Doslo je do problema u toku unosenja predloga : ERR : ${err.sqlMessage}\nCode : ${err.code}\n\tPredlog : ${predlog}\n\tKategorija : ${kategorija}\n\tSlovo : ${slovo}`);
            io.to(process.env.REG_KEY).emit("notification",{"msg":"PREDLOG ERROR"
                ,"line":613
                ,"file":"utils"
            })   
        }
        else
            console.log(`[${new Date()}] Predlog dodat`);
            io.to(process.env.REG_KEY).emit("notification",{"msg":"PREDLOG DODAT"
                ,"line":620
                ,"file":"utils"
            })   
    });
}

function timeout(room,localData,io){
        /*
        io.to(room).emit('roundEnd',{'Success': true,
        'MSG' : "Round end! evaluationuation started!",        
        'CODE' : 2
        })*/               
        clearTimeout(localData[room]['intervalObj'])
        const temp = setTimeout(evaluation, 7000, room,localData,io);
        localData[room]['intervalObj'] = temp
  
}

function returnRoom(res,sessionToken,localData){    
    pool.query(`select username,roomCode , kicked from player where sessionToken = ? `,sessionToken,(err, results, fields)=>{
        if(err){
            console.error(`[${new Date()}]Došlo je do problema prilikom vraćanja u sobu : ERR : ${err.sqlMessage}\nCode : ${err.code}\n\tSessionToken : ${sessionToken} `)     
            io.to(process.env.REG_KEY).emit("notification",{"msg":"RETURN ROOM ERROR"
                ,"line":643
                ,"file":"utils"
            })         
        }else{
            if(results.length == 0){
                res.statusCode = 500;
                res.setHeader("Content-Type", "application/json");
                res.json({
                    "ERR_MSG" : "Nije moguće vratiti se u sobu, napravite novu!"
                })
            }else{
                if(results[0]['roomCode'] in localData){
                    if(results[0]['kicked'] == 1){
                        res.statusCode = 500;
                        res.setHeader("Content-Type", "application/json");
                        res.json({
                            "ERR_MSG" : "Izbačeni ste iz sobe!"
                        })
                    }else{
                        res.statusCode = 200;
                        res.setHeader("Content-Type", "application/json");
                        res.json({
                            "username" : results[0]['username'],
                            "roomCode" : results[0]['roomCode']
                        })
                    }
                }else{
                    res.statusCode = 500;
                    res.setHeader("Content-Type", "application/json");
                    res.json({
                        "ERR_MSG" : "Soba više nepostoji, napravite novu!"
                    })
                }
            }
        }
    })
}

function insertUtisak(res,utisak){
    
    pool.query("insert into utisci values(DEFAULT,?,NOW());",[utisak],(err,results,fields)=>{
        if(err){
            console.error(`[${new Date()}]Doslo je do problema konekcije u unosenju utisaka : MSG :${err.sqlMessage}\nCODE : ${err.code}\n\tUtisak : ${utisak}`)
            io.to(process.env.REG_KEY).emit("notification",{"msg":"UTISAK ERROR"
                ,"line":687
                ,"file":"utils"
            })   
            res.status(500).send("Došlo je do problema")
        }else{
            console.log(`[${new Date()}]Utisak dodat!`)
            io.to(process.env.REG_KEY).emit("notification",{"msg":"UTISAK DODAT"
                ,"line":694
                ,"file":"utils"
            })   
            res.status(201).send("Uspeh")
        }
    })
}

module.exports = {
    playerReady,
    playerUnReady,
    timeout,
    dataCollector,
    evaluation,
    predlagac,
    startVoteKick,
    voteKickCounter,
    historyReq,
    returnRoom,
    insertUtisak
    
}