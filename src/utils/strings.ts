import { GameData } from "redis/game"

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

export const chooseLetter = async(room: string) => {
    const gameData = new GameData(room)

    let letters = await gameData.getLetters()
    if (letters == '') return letters

    const charAt = Math.floor(Math.random() * letters.length)
    const newLetter = letters[charAt]
    await gameData.setLetters(letters.replace(newLetter, ''), newLetter)

    return newLetter
}


export const defaultLetters = "abcčćddžđefghijklljmnnjoprsštuvzž"
export const RoomCodeRegEx = '^[A-Za-z0-9]{8}$'
export const UsernameRegEx = '^[A-Za-z0-9а-шА-ШčČćĆžŽšŠđĐђјљњћџЂЈЉЊЋЏ ]{416}$'
export const SessionTokenRegEx = '^[A-Za-z0-9]{96}$'