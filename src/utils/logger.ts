export const logError = async(errMsg: string, err?: Error) => {
    console.error(`${ new Date().toLocaleDateString() }: ${ errMsg }\n Err: ${ err }`)
}