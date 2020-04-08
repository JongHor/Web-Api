const express  = require('express')
const transactions = require("./data/data.json")
const uuid = require("uuid")
const bodyParser = require("body-parser")


// application object
const app = express()

// middleware section
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:true}))

// when you get method you send something move endpoint to /api/transactions
app.get('/api/v1.0/transactions', (req,res,next) => {
    res.json(transactions)
})

app.get('/api/v1.0/transactions/:id', (req,res,next) => {
    console.log(req.params.id)
    // response for response to cutomer

    // check transactions
    const t = transactions.find( t => t.id == req.params.id)
    if (!t){
        res.status(404).json({error:'transaction not found'})
    }else{
        res.status(200).json(t)
    }
})

app.post('/api/v1/transactions',(req,res) => {
    const name = req.body.name 
    const amount = req.body.amount
    const date = new Date()

    const t = {
        id:uuid.v4(),
        name: name,
        amount:Number(amount),
        created: date,
        updated: date
    }

    transactions.unshift(t)
    res.status(200).json(t)
})

app.delete('/api/v1/transactions/:id',(req,res)=>{
    const delete_index = transactions.findIndex( t => t.id == req.params.id)
    
    if(delete_index !== -1){
        transactions.splice(delete_index,1)
        res.status(200).json({message:"delete successful!"})
    }else{
        res.status(404).json({ error:'transaction not found'})
    }
})

app.put('/api/v1/transactions/:id',(req,res)=>{
    const update_index = transactions.findIndex( t => t.id == req.params.id)
    if(update_index !== -1){
        const t = {
                name: req.body.name,
                amount: Number(req.body.amount),
                updated: new Date()
            }
        res.status(200).json(Object.assign(transactions[update_index],t))
    }else{
        res.status(404).json({ error:'transaction not found'})
    }
})

app.get("/api/v1/:uid/transactions",(req,res,next)=>{
    res.json({uid:req.params.uid,treansactions:transactions})
})

// run on port 3000
app.listen(3000, () => {
    console.log("server is listening at port: 3000")
})