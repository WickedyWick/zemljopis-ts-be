import { redisDb } from "."

// testing only, delete before adding
export const test = async(): Promise<boolean> => {
  const res: any[]=  await redisDb.MULTI()
  .HSET(`room:tesat1`, { test1: 1, test2: 'kurac', test3:'ayayaya'})
  .SADD(`players:tesat1`, 'player')
  .EXEC()
  console.log({...res})
  return true
}