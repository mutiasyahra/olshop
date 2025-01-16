const express = require('express')
const cors = require('cors')
require('dotenv').config()
const olshopRoutes = require('./routes/olshop-routes')

const app = express()

app.use(cors())
app.use(express.json())
app.use('/api', olshopRoutes)

const port = process.env.PORT || 3000
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/api`)
})