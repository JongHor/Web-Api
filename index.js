const express  = require('express')
const bodyParser = require("body-parser")
const cors = require('cors');
require('dotenv').config()


// application object
const app = express()
// middleware section
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:true}))

// use cor
app.use(cors());
// const RouterV1 = require("./routes/transactionRouteV1")
// app.use(RouterV1)

// const RouterV2 = require("./routes/transactionRouteV2")
// app.use('/api/v2',RouterV2)

const RouterV3 = require("./routes/JonghorRouteV3")
app.use('/api/v3',RouterV3)


const PORT = process.env.PORT
const HOSTNAME = process.env.HOSTNAME

// // run on port 3000
app.listen(PORT,HOSTNAME, () => {
    console.log("server is listening at port: "+HOSTNAME+":"+PORT)
})