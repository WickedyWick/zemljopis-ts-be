import { logError } from "$lib/server/db/commands"
const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
export const createRoomCode = ():string => {
  try {
    let result: string = ''
    for (let i = 0; i < 8; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length))
    }
    return result
  } catch(err) {
      logError(String(err), 'createRoomCode')
      return ''
  }
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