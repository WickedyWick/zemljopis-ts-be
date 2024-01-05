import { redisDb } from "."

// testing only, delete before adding
export const test = async(): Promise<boolean> => {
  try {
    let s: number = 0;
    //@ts-ignore
    s.push()
  } catch(err) {
  }
  
  return true
}