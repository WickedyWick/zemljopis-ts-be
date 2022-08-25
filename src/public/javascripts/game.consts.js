export const RoomCodeRegEx = '^[A-Za-z0-9]{8}$'
export const UsernameRegEx = '^[A-Za-z0-9а-шА-ШčČćĆžŽšŠđĐђјљњћџЂЈЉЊЋЏ ]{4,16}$'
export const SessionTokenRegEx = '^[A-Za-z0-9]{96}$'
export const FieldDataRegExString = '^[A-Za-zа-шА-ШčČćĆžŽšŠđĐђјљњћџЂЈЉЊЋЏ ]{2,48}$'
// types of notifications
export const N_TYPE = {
    SUCCESS: 'success',
    WARNING: 'warning'
}

// button colors
export const BTN_COLORS = {
    RED: 'red',
    GREEN: 'green'
}
export const BTN_STATES = {
    BTN_NOT_READY: 'Nisi spreman!',
    BTN_READY: 'Spreman!',
    BTN_GAME_STARTED: 'Gotovo',
    BTN_GAME_END: 'KRAJ IGRE!'
}

export const CatToShort = {
    0: 'dr',
    1: 'gr',
    2: 'im',
    3: 'bl',
    4: 'zv',
    5: 'pl',
    6: 'rk',
    7: 'pr'
}
/**
 * Dictionary that holds records of cirilic and latinic alfabet
 */
export const letterDictionary = new Map([
    ['a', 'a'],
    ['б', 'b'],
    ['в', 'v'],
    ['г', 'g'],
    ['д', 'd'],
    ['ђ', 'đ'],
    ['е', 'e'],
    ['ж', 'ž'],
    ['з', 'z'],
    ['и', 'i'],
    ['ј', 'j'],
    ['к', 'k'],
    ['л', 'l'],
    ['љ', 'lj'],
    ['м', 'm'],
    ['н', 'n'],
    ['њ', 'nj'],
    ['о', 'o'],
    ['п', 'p'],
    ['р', 'r'],
    ['с', 's'],
    ['т', 't'],
    ['ћ', 'ć'],
    ['у', 'u'],
    ['ф', 'f'],
    ['х', 'h'],
    ['ц', 'c'],
    ['ч', 'č'],
    ['џ', 'dž'],
    ['ш', 'š'],
    [' ', ' ']
])

export const IndexField = {
    'dr': 0,
    'gr': 1,
    'im': 2,
    'bl': 3,
    'zv': 4,
    'pl': 5,
    'rk': 6,
    'pr': 7
}