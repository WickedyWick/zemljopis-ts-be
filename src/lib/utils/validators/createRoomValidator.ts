import type { ClassicDto, CreateRoomDto } from "../../types/types";
import { containsSpecialChar } from ".";
let invalidStrings: Set<string> = new Set(['[object object]', 'null', 'undefined', 'nan'])
/***** DTO Fields *****/
let createRoomFields: Set<string> = new Set(['username', 'password', 'playerCount'])

export const createRoomValidator = (body: CreateRoomDto):boolean | undefined => {
  try {
    let rightCount: number = 0
    let totalCount: number = 0
    for (const property in body) {
      totalCount++
      // shortcirtuit huge objects
      if (totalCount > createRoomFields.size)
        return false

      if (!createRoomFields.has(property)) {
        return false
      }
      switch (property) {
        case 'username':
          let username: string = String(body[property])
          
          if (invalidStrings.has(username.toLowerCase()))
            return false
     
          if (username.length < 3 || username.length > 24 || containsSpecialChar(username))  
            return false
            
          rightCount++;
          break;
        case 'password':
          // NIY
          let pwd: string = String(body[property])
          if (pwd != '')
            return false
          rightCount++;
          break;
        case 'playerCount':
          if (!Number.isInteger(Number(body[property])))
            return false
          let pc: number = Number(body[property])
          if (pc < 1 || pc > 10)
            return false
          rightCount++;
          break;
        default:
          return false
      }
    }
    return rightCount == createRoomFields.size;
    
  } catch(err) {
    console.log(err)
    // log to db
    return undefined
  }
}