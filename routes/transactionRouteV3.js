const express = require('express')
const router = express.Router()
require('dotenv').config()

// import model
const Transaction = require('../models/transactionModel')
const User = require('../models/userModel')

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

// import authentication middleware
const auth = require("../middleware/auth")

/************************ User Endpoint ********************************************/

router.post('/users',async (req,res) => {
    try {
        const user = new User(req.body)
        
        // trigger '.pre' middleware
        await user.save()
        const token =  await user.generateAuthToken()


        res.status(201).json({ msg: 'add user successful',user,token})
    } catch (error){
        res.status(400).json({error:error.message})
    }
})

router.post('/users/login',async (req,res) => {
    try{
        const {email, password } = req.body
        const user = await User.findByCredentials(email,password)

        if(!user){
            return res.status(200).json({error: 'Login failed, please check your credentials'})
        }

        const token = await user.generateAuthToken()
        res.status(200).json({token})
    }catch(error){
        res.status(400).json({error:error.message})
    }
})

router.get('/users/me',auth,(req,res) => {
    const user = req.user
    res.status(201).json({user})
})

router.get('/users/logout',auth,async (req,res) => {
    const user = req.user 
    const current_token = req.token
    
    try{
        user.tokens = user.tokens.filter( item => {return item.token!==current_token})
        await user.save()
        res.status(201).json({msg:'log out successful'})
    }catch(error){
        res.status(500).json({error:error.message})
    }
})

router.post('/users/logoutall',auth, async(req,res) => {
    const user = req.user
    try{
        // remove item [0] to item [(n-1)]
        user.tokens.splice(0,user.tokens.length)
        await user.save()
        res.status(201).json({mesg:'log out all successful'})
    }catch(error){
        res.status(500).json({error:error.message})
    }
    
})

/************************ Transaction Endpoint ********************************************/

// when you get method you send something move endpoint to /api/transactions
router.get('/transactions',auth,async (req,res,next) => {
    const user = req.user
    try{
        const transaction = await Transaction.find({_uid: user._id})
        res.status(200).json(transaction)
    }catch(err){
        res.status(500).json({error:err.message})
    }
})

router.get('/transactions/:id',auth, async(req,res,next) => {
    // check transactions
    const user = req.user
    try{
        const t = await Transaction.find({_uid: user._id,_id:req.params.id})
        res.status(200).json(t)
    }catch(err){
        res.status(500).json({error:'transaction not found'})
    }
})

router.post('/transactions',auth,async (req,res) => {
    const user = req.user
    const t = new Transaction(req.body)
    t._uid = user._id

    try{
        await t.save() 
        res.status(200).json(t)
    }
    catch (error){
        res.status(500).json({error:error.message})
    }
})

router.delete('/transactions/:id' , auth ,async (req,res)=>{
    const user = req.user
    try{
        const t = await Transaction.findByIdAndDelete({_id:req.params.id,_uid:user._id})
        res.status(200).json({message:"delete successful!"})
    }catch(err){
        res.status(500).json({eror:err.message})
    }
   
})

router.put('/transactions/:id',auth,async (req,res)=>{
    const user = req.user
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