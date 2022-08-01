import { GameData } from 'redisDb/game'

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
    const newLetter = await cirilicaLatinica.get(letters[charAt])
    await gameData.setLetters(letters.replace(newLetter, ''), newLetter)
    return newLetter
}

export const cirilicaLatinica = new Map<string, string>([
    ['А','A'],
    ['Б','B'],
    ['В','V'],
    ['Г','G'],
    ['Д','D'],
    ['Ђ','Đ'],
    ['Е','E'],
    ['Ж','Ž'],
    ['З','Z'],
    ['И','I'],
    ['Ј','J'],
    ['К','K'],
    ['Л','L'],
    ['Љ','LJ'],
    ['М','M'],
    ['Н','N'],
    ['Њ','NJ'],
    ['О','O'],
    ['П','P'],
    ['Р','R'],
    ['С','S'],
    ['Т','T'],
    ['Ћ','Ć'],
    ['У','U'],
    ['Ф','F'],
    ['X','H'],
    ['Ц','C'],
    ['Ч','Č'],
    ['Џ','DŽ'],
    ['Ш','Š'],
    ['', '']
])

// I want application in latinic but letters are in cirilic cause some latinic
// letters are 2 chars and it won't work with curren't implementation of selecting letters
export const defaultLetters = 'АБВГДЂЕЖЗИЈКЛЉМНЊОПРСТЋУФХЦЧЏШ'
export const RoomCodeRegEx = '^[A-Za-z0-9]{8}$'
export const UsernameRegEx = '^[A-Za-z0-9а-шА-ШčČćĆžŽšŠđĐђјљњћџЂЈЉЊЋЏ ]{4,16}$'
export const SessionTokenRegEx = '^[A-Za-z0-9]{96}$'