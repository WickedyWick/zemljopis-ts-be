import type { ClassicDto, CreateRoomDto, JoinRoomDto } from "../../types/types";
import { containsSpecialChar } from ".";
let invalidStrings: Set<string> = new Set(['[object object]', 'null', 'undefined', 'nan'])
/***** DTO Fields *****/
let createRoomFields: Set<string> = new Set(['username', 'password', 'roomCode'])

export const joinRoomValidator = (body: JoinRoomDto):boolean | undefined => {
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

          body[property] = body[property].trim()  
          rightCount++;
          break;
        case 'password':
          // NIY
          let pwd: string = String(body[property])
          if (pwd != '')
            return false

          body[property] = body[property].trim()  
          rightCount++;
          break;
        case 'roomCode':
          let rc: string = String(body[property])
          if (invalidStrings.has(rc.toLowerCase()))
            return false

          if (rc.trim().length != 8)
            return false
  
          body[property] = body[property].trim() 
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