export const RoomCodeRegEx = '^[A-Za-z0-9]{8}$'
export const UsernameRegEx = '^[A-Za-z0-9а-шА-ШčČćĆžŽšŠđĐђјљњћџЂЈЉЊЋЏ ]{4,16}$'
export const SessionTokenRegEx = '^[A-Za-z0-9]{96}$'

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
    BTN_READY: 'Spreman!'
}
