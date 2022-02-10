let btnUtisak =document.getElementById("btnUtisak")
let txbUtisak = document.getElementById("utisak")
let serverAddress = serverAdress()
btnUtisak.addEventListener('click',(e)=>{
    e.preventDefault()
    let statusCode;
    $(btnUtisak).prop("disabled",true)
    fetch(`${serverAddress}utisak`,{
        method:"POST",
        body: JSON.stringify({"utisak": txbUtisak.value}),
        headers: {"Content-type":"application/json; charset=UTF-8"}
    }).then(response =>{
        $(btnUtisak).prop("disabled",false)
        if(response.status == 201){
            new Noty({
                theme : 'metroui',
                type : 'success',
                layout : 'topRight',
                text : "Utisak uspešno ostavljen!",
                timeout : 5000,
                progressBar :true
            }).show()
            txbUtisak.value = ""
        }
        else if(response.status == 500){
            new Noty({
                theme : 'metroui',
                type : 'error',
                layout : 'topRight',
                text : "Došlo je do problema pokušajte ponovo kasnije!",
                timeout : 5000,
                progressBar :true
            }).show()
        }
    }).catch(err =>{
        console.log(err)
        new Noty({
        theme : 'metroui',
        type : 'error',
        layout : 'topRight',
        text : "Došlo je do problema pokušajte ponovo kasnije!",
        timeout : 5000,
        progressBar :true
    }).show()})
})