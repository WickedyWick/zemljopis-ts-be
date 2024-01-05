import { redisDb } from "."

// testing only, delete before adding
export const test = async(): Promise<boolean> => {
  try {
    const res = await redisDb.ft.INFO('kurac')
    console.log(res)
  } catch(err){
    console.log('kurac');
    
  }
  
  return true
}