const express  = require('express')
const bodyParser = require("body-parser")
const cors = require('cors');
const aws = require('aws-sdk');
require('dotenv').config()

const PORT = process.env.PORT || 3000

// application object
const app = express()
// middleware section
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:true}))

// use cor
app.use(cors());
// app.use((req, res, next) => {
//     res.header('Access-Control-Allow-Origin', 'https://jonghor.herokuapp.com')
//     res.header('Access-Control-Allow-Methods','POST, GET, PUT, PATCH, DELETE, OPTIONS')
//     res.header('Access-Control-Allow-Headers','Content-Type, Option, Authorization')
//     return next()
//  })
// const RouterV1 = require("./routes/transactionRouteV1")
// app.use(RouterV1)

// const RouterV2 = require("./routes/transactionRouteV2")
// app.use('/api/v2',RouterV2)

const RouterV3 = require("./routes/JonghorRouteV3")
app.use('/api/v3',RouterV3)


// const PORT = process.env.PORT
// const HOSTNAME = process.env.HOSTNAME

// // // run on port 3000
app.listen(PORT, () => {
    console.log(`server is listening at port: ${PORT}`)
})