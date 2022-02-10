function bg(){
    let index = Math.floor(Math.random() * 4)
    document.body.style.backgroundImage = `url(../public/images/bg${index}.jpg)`
    setInterval(()=>{
    console.log("CHANGE")
    index ++ 
    if(index >3)
        index = 0

    document.body.style.backgroundImage = `url(../public/images/bg${index}.jpg)`
    },5000)
}