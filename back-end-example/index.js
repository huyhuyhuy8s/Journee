// Back-end use CommonJS for importing packages

const express = require('express')
const app = express()

let message = 'Hello world'

app.get('/', (req, res) => {
  res.send(`<h1>${message}</h1>`)
})

app.get('/api/message', (req, res) => {
  res.json(message)
})

const PORT = 3001
app.listen(PORT)
console.log(`Server is running on port ${PORT}`)
