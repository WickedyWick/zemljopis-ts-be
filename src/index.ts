import express from 'express'

const app = express()

app.listen(process.env.PORT, () => {
    console.log(`--> Server started at http://localhost:${process.env.PORT}`)
  })
