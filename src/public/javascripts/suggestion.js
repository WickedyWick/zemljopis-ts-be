document.getElementById('btn').addEventListener('click', (e) => {
    const suggestion = document.getElementById('suggestionTextArea').value
    const regEx = new RegExp('^[A-Za-zа-шА-ШčČćĆžŽšŠđĐђјљњћџЂЈЉЊЋЏ,.;!? ]{2,3600}$')
    if (!regEx.test(suggestion)) return notify('warning', 'Document mora biti dužine izmedju 2 i 3600 karaktera. Specijalni karakteri dozvoljeni su: .,;?!')
    disableButton()
    axios({
        method: 'post',
        url: '/suggestion/suggest-general',
        data: {
            suggestion
        },
        timeout: 10000
    }).then((res) => {
        if(res.status == 500 || res.status == 400) {
            notify('warning', 'Došlo je do problema, pokušajte ponovo')
        }else if(res.status == 201){               
            notify('success', 'Utisak uspešno ostavljen!')
            document.getElementById('suggestionTextArea').value = ''
        } else {
            notify('warning', 'Došlo je do problema, pokušajte ponovo')
        }
        enableButton()
        
    }).catch((err) => {
        console.log(err)
        notify('warning', 'Došlo je do problema, pokušajte ponovo')
        disableButton()
    })
})

/**
 * This function disables button
 */
const disableButton = () => {
    document.getElementById('btn').disabled = true
}

/**
 * This function enables button
 */
 const enableButton = () => {
    document.getElementById('btn').disabled = true
}

/**
 * @param  {string} type - Type of notification
 * @param  {string} message - Message to be shown
 */
const notify = (type, message) => {
    // type: warning, info, success
    new Noty({
        theme: 'metroui',
        type: type,
        layout: 'topRight',
        text: message,
        timeout: 5000,
        progressBar: true
    }).show()
}