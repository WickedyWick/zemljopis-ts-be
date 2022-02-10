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