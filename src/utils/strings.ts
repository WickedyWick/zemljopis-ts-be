export const makeRoomCode = async () => {
    try {
        let result = ''
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
        for (let i = 0; i < 8; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length))
        }
        return result
    } catch(err) {
        console.log(`Error during loading creating room coode!Err : ${ err }`)
        return ''
    }

}

export const defaultLetters = ["a","b","c","č","ć","d","dž","đ","e","f","g","h","i","j","k","l","lj","m","n","nj","o","p","r","s","š","t","u","v","z","ž"]