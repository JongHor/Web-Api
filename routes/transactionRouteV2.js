const express = require('express')
const Transaction = require('../models/transactionModel')
const router = express.Router()
require('dotenv').config()

const mongoose = require('mongoose')
const conStr  = process.env.DATABASE_URL.replace("<password>",process.env.DATABASE_PWD)
                                        .replace("<database>",process.env.DATABASE_NAME)
mongoose.connect(conStr,{useNewUrlParser:true,
                        useUnifiedTopology:true,
                        useFindAndModify:false,
                        useCreateIndex: true})
const db = mongoose.connection
db.on('error',() => console.log("Database connection error"))
db.once("open",()=> console.log("Database connected"))

const transactions = []

// when you get method you send something move endpoint to /api/transactions
router.get('/transactions',async (req,res,next) => {
    try{
        const transaction = await Transaction.find()
        res.status(200).json(transaction)
    }catch(err){
        res.status(500).json({error:err.message})
    }
})

router.get('/transactions/:id', async(req,res,next) => {
    // check transactions
    try{
        const t = await Transaction.findById(req.params.id)
        res.status(200).json(t)
    }catch(err){
        res.status(500).json({error:'transaction not found'})
    }
})

router.post('/transactions',async (req,res) => {
    const t = new Transaction(req.body)

    try{
        await t.save() 
        res.status(200).json(t)
    }
    catch (error){
        res.status(500).json({error:error.message})
    }
})

router.delete('/transactions/:id' , async (req,res)=>{
    try{
        const t = await Transaction.findByIdAndDelete(req.params.id)
        res.status(200).json({message:"delete successful!"})
    }catch(err){
        res.status(500).json({eror:err.message})
    }
   
})

router.put('/transactions/:id',async (req,res)=>{
    const update_t = {
        name: req.body.name,
        amount: Number(req.body.amount),
        updated: new Date()
    }
    try{
        const t = await Transaction.findByIdAndUpdate(req.params.id,update_t,{new:true})
        if(!t)
            res.status(404).json({error:'Update::transaction not found'})
        res.status(200).json(t)
    }catch(err){
        res.status(500).json({eror:err.message})
    }
})

router.get("/:uid/transactions",(req,res,next)=>{
    res.json({uid:req.params.uid,treansactions:transactions})
})

module.exports = router