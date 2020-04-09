const express = require('express')
const router = express.Router()
require('dotenv').config()

// import model
const Hor = require('../models/horModel')
const User = require('../models/userModel')

const mongoose = require('mongoose')
const conStr  = process.env.DATABASE_URL 
console.log(conStr)
mongoose.Promise = global.Promise
mongoose.set('debug',true)
mongoose.connect(conStr,{useNewUrlParser:true,
                        useUnifiedTopology:true,
                        useFindAndModify:false,
                        useCreateIndex: true})
const db = mongoose.connection

var teaa = null
db.on('error',() => {teaa=false;console.log("Database connection error")})
db.once("open",()=> {teaa=true;console.log("Database connected")})

// import authentication middleware
const auth = require("../middleware/auth")

/************************ User Endpoint ********************************************/
router.post('/users/signup',async (req,res) => {
    try {
        const user = new User(req.body)
        
        // trigger '.pre' middleware
        await user.save()
        const token =  await user.generateAuthToken()


        res.send({ msg: 'add user successful',user,token})
    } catch (error){
        res.send({error:error.message})
    }
})

router.post('/users/login',async (req,res) => {
    try{
        const {email, password } = req.body
        const user = await User.findByCredentials(email,password)

        if(!user){
            res.send("You Not My Member!!! please sign up ")
        }

        const token = await user.generateAuthToken()
        res.send({token})
    }catch(error){
        res.send({error:error.message,req})
    }
})

router.get('/users/me',auth,(req,res) => {
    const user = req.user
    res.send({user})
})

router.get('/users/logout',auth,async (req,res) => {
    const user = req.user 
    const current_token = req.token
    
    try{
        user.tokens = user.tokens.filter( item => {return item.token!==current_token})
        await user.save()
        res.send({msg:'log out successful'})
    }catch(error){
        res.send({error:error.message})
    }
})

router.post('/users/logoutall',auth, async(req,res) => {
    const user = req.user
    try{
        // remove item [0] to item [(n-1)]
        user.tokens.splice(0,user.tokens.length)
        await user.save()
        res.send({mesg:'log out all successful'})
    }catch(error){
        res.send({error:error.message})
    }
})

router.put('/users/edit/:id',auth,async(req,res)=>{
    const update_t = {
        firstname:req.body.firstname,
        lastname:req.body.lastname,
        username:req.body.username,
        email:req.body.email,
        password:req.body.password,
        updated:Date.now()
    }
    try{
        const t = await Hor.findByIdAndUpdate(req.params.id,update_t,{new:true})
        if(!t)
            res.status(404).json({error:'Update::transaction not found'})
        res.status(200).json(t)
    }catch(err){
        res.status(500).json({eror:err.message})
    }
})

/************************ Transaction Endpoint ********************************************/

// when you get method you send something move endpoint to /api/hor
// It's Work
router.get('/hor',async (req,res,next) => {
    const user = req.user
    try{
        const hor = await Hor.find()
        res.send(hor)
    }catch(err){
        res.send({error:err.message})
    }
})

// get hor by id
router.get('/hor/:id',auth, async(req,res,next) => {
    // check transactions
    const user = req.user
    try{
        const t = await Hor.find({_uid:req.params.id})
        res.status(200).json(t)
    }catch(err){
        res.status(500).json({error:'transaction not found'})
    }
})

router.post('/hor',auth,async (req,res) => {
    const user = req.user
    const t = new Hor(req.body)
    t._uid = user._id

    try{
        await t.save() 
        res.status(200).json(t)
    }
    catch (error){
        res.status(500).json({error:error.message})
    }
})

// delete Hor
router.delete('/hor/:id' , auth ,async (req,res)=>{
    const user = req.user
    try{
        const t = await Hor.findByIdAndDelete({_id:req.params.id,_uid:user._id})
        res.status(200).json({message:"delete successful!"})
    }catch(err){
        res.status(500).json({eror:err.message})
    }
   
})

// update when you book room
router.put('/hor/:id',auth,async (req,res)=>{
    const user = req.user
    const update_t = {
        name: req.body.name,
        amount: Number(req.body.amount),
        updated: new Date()
    }
    try{
        const t = await Hor.findByIdAndUpdate(req.params.id,update_t,{new:true})
        if(!t)
            res.status(404).json({error:'Update::transaction not found'})
        res.status(200).json(t)
    }catch(err){
        res.status(500).json({eror:err.message})
    }
})

router.get("/:uid/hor",(req,res,next)=>{
    res.json({uid:req.params.uid,hor:hor})
})

module.exports = router