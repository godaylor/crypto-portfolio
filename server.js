const express = require('express')
const app = express()
const post = 80

app.use(express.static('frontend/dist'))

app.listen(port, () => console.log('Server has been started on port 80 ... '))
