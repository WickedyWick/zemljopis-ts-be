const utils  = require('./utils.js')
var pool = require('./trueMysql.js')
const cryptoRandomString = require('crypto-random-string');
var moment = require('moment')
require('dotenv').config({path: __dirname + '../.env'})

function joinRoomSQL(res,room,username,localData,io){
    if(room in localData){
        if(localData[room]['playerCount'] > Object.keys(localData[room]['playersID']).length){
            pool.getConnection((err,connection) =>{
                if(err){                    
                    console.error(`[${new Date}] ERROR CONNECTING TO THE DATABASE : Code ${err.code}\mMSG : ${err.sqlMessage}`)
                    io.to(process.env.REG_KEY).emit("notification",{"msg":"DB CONNECT ERR"
                        ,"line":13
                        ,"file":"mysql"
                    })
                    res.statusCode = 500;
                    res.setHeader("Content-Type", "application/json");
                    res.json({
                        "Data" : "Doslo je do problema sa pridruzivanjem u sobu, pokusajte kasnije!"
                    })                    
                }else{                  
                    connection.query(`select username from player where roomCode = '${room}' and username = '${username}';`,(err,result,fields) =>{
                        //console.log(process.env.REG_KEY)
                        if(err){
                            console.error(`[${new Date}]ERROR WHILE SELECTING USERNAME FROM DATABASE : Code ${err.code}\nMSG : ${err.sqlMessage}\n\t Room : ${room}\n\t Username : ${username}`)
                            io.to(process.env.REG_KEY).emit("notification",{"msg":"DB SELECT ERR"
                                ,"line":27
                                ,"file":"mysql"
                            })  
                            res.statusCode = 500;
                            res.setHeader("Content-Type", "application/json");
                            res.json({
                                "ERR_MSG" : "Doslo je do problema , pokusajte kasnije!"
                            })
                        }else{
                            if(result.length ==0){
                                    let sessionToken = cryptoRandomString({length: 48, type: 'alphanumeric'})
                                    connection.query(`insert into player values(DEFAULT,'${room}','${username}','${sessionToken}',0);`, (err,results,fields) =>{
                                        if(err){
                                            console.error(`[${new Date}]ERROR WHILE INSERTING PLAYER INTO DATABASE : Code ${err.code}\nMSG : ${err.sqlMessage}\n\t Room : ${room}\n\t Username : ${username}\n\t SessionToken : ${sessionToken}`)
                                            io.to(process.env.REG_KEY).emit("notification",{"msg":"DB INSERT ERR"
                                                ,"line":42
                                                ,"file":"mysql"
                                            })
                                            if(err.code =="ER_NO_REFERENCED_ROW_2" ){
                                                res.statusCode = 500;
                                                res.setHeader("Content-Type", "application/json");
                                                res.json({
                                                    "ERR_MSG" : "Soba ne postoji!"
                                                })
                                            }else
                                                res.statusCode = 500;
                                                res.setHeader("Content-Type", "application/json");
                                                res.json({
                                                    "ERR_MSG" : "Doslo je do problema , pokusajte kasnije!"
                                                })
                                        }
                                        else{                                           
                                            localData[room]['players'][username] = results.insertId
                                            localData[room]['playersID'][results.insertId] = username
                                            res.statusCode = 201;
                                            res.setHeader("Content-Type", "application/json");
                                            res.json({
                                                'username': username,
                                                'roomCode': room,
                                                'sessionToken': sessionToken
                                            })                                            
                                           
                                        }
                                    } )
                                    
                                
                            }
                            else{
                                res.statusCode = 500;
                                res.setHeader("Content-Type", "application/json");
                                res.json({
                                    "ERR_MSG": "Korisnicko ime u toj sobi vec postoji, izaberite drugo korisnicko ime!"
                                })                                
                            }                  
                        }
                    })
                }
                connection.release()
            })
        }else{
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.json({
                "ERR_MSG" : "Soba je puna!"
            })   
            }
        }   
    else{
        res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.json({
                "ERR_MSG" : "Soba više ne postoji , kreirajte novu !"
            })   
    }
}

function createRoom(res,username,playerCount,roundTimeLimit,localData,io){
   
    //Prvo se kreira soba , pa se pravi igrac, pa se pravi runda kada se svi pridruze!
    // kada su svi ready      
           // io.to("TESTKEY").emit("mTest",{"test":"EMITER"})    
            createRoomCode().then((response) =>{
                pool.getConnection((err,connection) => {
                    if (err) 
                    {   
                        console.error(`[${new Date()}]ERROR WHILE CONNECTING TO THE DATABASE : Code : ${err.code}\nMSG : ${err.sqlMessage}`)
                        io.to(process.env.REG_KEY).emit("notification",{"msg":"DB CONNECT ERR"
                            ,"line":114
                            ,"file":"mysql"
                        })
                        res.statusCode = 500;
                        res.setHeader("Content-Type", "application/json");
                        res.json({
                            "ERR_MSG": "Problem prilikom kreiranje sobe, pokusajte kasnije!"
                        })  
                    }      
                    else{
                        let sessionToken = cryptoRandomString({length: 48, type: 'alphanumeric'})
                        let sql = `insert into room values(DEFAULT,'${response}',${playerCount},curdate(),0);insert into player values(DEFAULT,'${response}','${username}','${sessionToken}',0);`;
                        
                        let trueRes =0;
                        
                        connection.query(sql, function (err, results) {
                            if (err){
                                //ER_DUP_ENTRY for duplicate entry
                                console.error(`[${new Date()}]ERROR WHILE INSERTING VALUES INTO ROOM : Code : ${err.code}\nMSG : ${err.sqlMessage}\n\tResponse : ${response}\n\tUsername : ${username}\n\tPlayerCount : ${playerCount}\n\tSessionToken : ${sessionToken}`)
                                io.to(process.env.REG_KEY).emit("notification",{"msg":"DB INSERT ERR"
                                    ,"line":134
                                    ,"file":"mysql"
                                })
                                res.statusCode = 500;
                                res.setHeader("Content-Type", "application/json");
                                res.json({
                                    "ERR_MSG": "Problem prilikom kreiranje sobe, pokusajte kasnije!"
                                })  
                            }else{           
                                console.log("Room creation successfull!")
                                let date = new Date();
                                localData[response] = {
                                    'playerCount' : playerCount,
                                    'playersReady' : 0,
                                    'roundNumber' : 1,
                                    'roundTimeLimit': Number(roundTimeLimit),
                                    'roundActive' : false,
                                    'roundID': null, //ovo mozda sada nije potrebno
                                    'roundIDS' :{},
                                    'players' : {},
                                    'playersID' : {},                                    
                                    'intervalObj' : null,
                                    'availableLetters':["a","b","c","č","ć","d","dž","đ","e","f","g","h","i","j","k","l","lj","m","n","nj","o","p","r","s","š","t","u","v","z","ž"],
                                    'currentLetter': '',
                                    'evalFuncExecuting' : false,
                                    'data': {},
                                    'momentCreated' : moment([date.getFullYear(),date.getMonth()+1,date.getDate(),date.getHours(),date.getMinutes(),date.getSeconds()])
                                    
                                }
                                localData[response]['players'][username] = results[1].insertId
                                localData[response]['playersID'][results[1].insertId] = username
                                
                                
                                res.statusCode = 201;
                                res.setHeader("Content-Type", "application/json");
                                res.json({
                                    'roomCode':response,
                                    'username': username,
                                    'sessionToken': sessionToken
                                })          
                            }
                            
                        });
                    }
                   
                    connection.release()
                })
            
            },(reject)=>{
                console.error(`[${new Date()}]There was problem while creating room code!`)
                io.to(process.env.REG_KEY).emit("notification",{"msg":"ROOM CODE CREATION ERR"
                    ,"line":185
                    ,"file":"mysql"
                })
                res.statusCode = 500;
                res.setHeader("Content-Type", "application/json");
                res.json({
                    'ERR_MSG' : "Problem prilikom kreiranje sobe, pokusajte ponovo!"
                }) 
            })

}

function joinRoom(socket,room,username,sessionToken,localData,io){
    if(room in localData){
        pool.getConnection((err,connection) =>{
            if(err){
                console.error(`[${new Date()}]ERROR CONNECTING TO THE DATABASE : Code ${err.code}\mMSG : ${err.sqlMessage}`)
                io.to(process.env.REG_KEY).emit("notification",{"msg":"DB CONNECT ERR"
                    ,"line":203
                    ,"file":"mysql"
                })
                socket.emit('load',{'Success' : false,
                    "ERR_MSG" : "Problem prilikom ulaska u sobu!"
                })
            }else{
                //select username, SUM(bodovi) from player join data on player.playerID = data.playerID where roomCode = "MQul2FvC" GROUP by username #ukupni bodovi za sve korisniike u sobi
                //select SUM(bodovi) from player join data on player.playerID = data.playerID where username = "Aleasjk" and roomCode = "MQul2FvC" #ukupni bodovi za specificnog usera
                //daje null ili 0 (null ako nije odigrana ni jedna runda)
                //********* */testiraj ovde da li je brze querivati ostale querije npr if(kicked ==0) pa opet queri if(sessiontoken===) pa opet queri za ostale***************
                connection.query(`select username , kicked from player where roomCode = '${room}' and username = '${username}';select sessionToken from player where roomCode = '${room}' and username = '${username}';select SUM(bodovi) as ukupnoBodova from data join player on data.playerID = player.playerID where roomCode = '${room}' and username = '${username}';select username, SUM(bodovi) as ukupnoBodova from player join data on player.playerID = data.playerID where username != "${username}" and roomCode = "${room}" and kicked = 0 group by username`,(err,result,fields)=>{
                    if(err){
                        console.error(`[${new Date()}]ERROR SELECTING USERNAME FROM PLAYER : Code ${err.code}\nMSG : ${err.sqlMessage}\n\tUsername : ${username}\n\tRoom : ${room}`)
                        io.to(process.env.REG_KEY).emit("notification",{"msg":"DB SELECT ERR"
                            ,"line":218
                            ,"file":"mysql"
                        })
                        socket.emit('load',{'Success' : false,
                            "ERR_MSG" : "Problem prilikom ulaska u sobu!"
                        })
                    }
                    else{
                        //console.log(result)
                        if(result[0].length == 0 ){
                            socket.emit('load',{'Success':false,
                                "ERR_MSG" : "Korisničko ime u sobi ne postoji!"
                            })
                        }else if(result[1].length == 0){
                            socket.emit('load',{'Success':false,
                                "ERR_MSG" : "Token sesije ne postoji , nije se moguće vratiti u sobu!"
                            })
                        }
                        else{
                            
                            if(result[0][0]['kicked'] == 1)
                                socket.emit('load',{'Success':false,
                                    "ERR_MSG" : "Izbačeni ste , nije moguće vratiti se u sobu."
                                })
                            else{
                                if(result[1][0]['sessionToken'] === sessionToken){
                                    socket.join(room)
                                    try{
                                    sockets[socket.id]['username'] = username
                                    sockets[socket.id]['room'] = room
                                    }catch(err){
                                        console.error(`[${new Date()}]Error while inserting username and room into sockets\nErr : ${err}\n\tSockets : ${sockets}`)
                                        io.to(process.env.REG_KEY).emit("notification",{"msg":"SOCKET INSERT ERR"
                                            ,"line":250
                                            ,"file":"mysql"
                                        })
                                    }
                                    //console.log(sockets)
                                    if(result[2][0]['ukupnoBodova'] === null)
                                        socket.emit('load',{'Success' : true,
                                        "MSG" : `Uspešan ulazak u sobu : ${room}`,
                                        "playerCount" : localData[room]['playerCount'],
                                        "playersReady" : localData[room]['playersReady'],
                                        "roundActive" : localData[room]['roundActive'],
                                        "roundNumber" : localData[room]['roundNumber'],
                                        "vreme": localData[room]['roundTimeLimit'],
                                        "points" : 0,
                                        
                                    })
                                    else
                                        socket.emit('load',{'Success' : true,
                                            "MSG" : `Uspešan ulazak u sobu : ${room}`,
                                            "playerCount" : localData[room]['playerCount'],
                                            "playersReady" : localData[room]['playersReady'],
                                            "roundActive" : localData[room]['roundActive'],
                                            "roundNumber" : localData[room]['roundNumber'],
                                            "vreme": localData[room]['roundTimeLimit'],
                                            "points" : result[2][0]['ukupnoBodova'],                                   
                                        })                                    
                                    playerPointDict = {}
                                    players = Object.keys(localData[room]['players'])
                                    
                                    //ne treba provera da li vec postoji u dictionary jer su usernamovi po sobi unique
                                        // mora dva fora prvi za one usere koji su odigrali rundu, drugi za one koji nisu jer im baza daje rezultat null , 
                                    // *******mozda moze brze ako proverim broj rundi , ali u slucaju da korisnik nije prisutan u sobi prilikom pocetka evaluacije njegov data se nece kreirati za tu rundu ****
                                    // ->ako hocu da se kreira onda moram tamo for (isto mi dodje mislim)
                                    for(let i=0;i<result[3].length;i++){
                                        let usr = result[3][i]['username']
                                        if(usr != null || user != "null")
                                            playerPointDict[usr] = result[3][i]['ukupnoBodova']
                                    }
                                    
                                    for(let i=0;i<players.length;i++){
                                        if(!(players[i] in playerPointDict))
                                            playerPointDict[players[i]] = 0
                                    }
                                    socket.to(room).broadcast.emit('playerJoinMsg',`${username} just joined the room!`)
                                    //MODE START ILI UPDATE (= ili += na klijentu)
                                    io.to(room).emit('playerList',{'players' :playerPointDict,
                                        "MODE" : "START"
                                    })
                                    if('kickVote' in localData[room])
                                        socket.emit('startVoteKickResponse',{"Success" : true,
                                        "MSG": `U toku je glasanje za izbacivanje igrača : ${username}`,                
                                        "username" : username})
                                }else{
                                    socket.emit('load',{'Success':false,
                                        'ERR_MSG' : 'Nije moguće vratiti se u sobu nakon ulaska u drugu sobu!'
                                    })
                                }
                            }
                            
                        }
                    }
                })
            }
            connection.release()
        })
    }else
    socket.emit("roomNotExist","Soba više ne postoji , kreirajte novu!");
    
}

function createRoomCode() {
    return new Promise(function(resolve, reject) {
        values = ['Q','q','W','w','e','E','R','r','T','t','Y','y','U','u','I','i','O','o','P','p','A','a','S','s','D','d','F','f','G','g','H','h','J','j','K','k','L','l','Z','z','X','x','C','c','V','v','B','b','N','n','M','m','0','1','2','3','4','5','6','7','8','9']
        res =''
        for(let i =0;i<8;i++){
            res +=(values[Math.floor(Math.random() * values .length)])
        }
        if(res.length == 8)
            resolve(res)
        else
            reject(null)
        
    })
    
}



module.exports = {
    createRoom,
    joinRoomSQL,
    joinRoom

}