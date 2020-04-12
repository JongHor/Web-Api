const express = require('express')
const router = express.Router()
require('dotenv').config()
const cors = require('cors');
const bcrypt = require('bcryptjs')

var corsOptions = {
        origin: 'https://jonghor-ba5d2.web.app',
        optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}
// import model
const Hor = require('../models/horModel')
const User = require('../models/userModel')
const Book = require('../models/bookModel')

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
router.post('/users/signup',cors(corsOptions),async (req,res) => {
    try {
        const user = new User(req.body)
        
        // trigger '.pre' middleware
        await user.save()
        const token =  await user.generateAuthToken()


        res.status(200).send({ msg: 'add user successful',user,token})
    } catch (error){
        res.status(201).send({error:error.message})
    }
})

router.put('/users/book/:id',auth,async(req,res)=>{
    const user = req.user
    const update_t = {
        booked:req.body.booked
    }
    try{
        const t = await User.findByIdAndUpdate(req.params.id,update_t,{new:true})
        if(!t)
            res.status(201)({error:'Update::transaction not found'})
        user.save()
        res.status(200).send(t)
    }catch(err){
        res.status(201).send({eror:err.message})
    }
})

router.post('/users/login',async (req,res) => {
    try{
        const {email, password } = req.body
        const user = await User.findByCredentials(email,password)

        if(!user){
            res.status(201).send("You Not My Member!!! please sign up ")
        }

        const token = await user.generateAuthToken()
        res.status(200).send({token})
    }catch(error){
        res.status(201).send({error:error.message})
    }
})

router.get('/users/me',auth,(req,res) => {
    const user = req.user
    try{
        res.status(200).send({user})
    }catch(error){
        res.status(201).send({error:error.message})
    }
})

router.get('/users/logout',auth,async (req,res) => {
    const user = req.user 
    const current_token = req.token
    
    try{
        user.tokens = user.tokens.filter( item => {return item.token!==current_token})
        await user.save()
        res.status(200).send({msg:'log out successful'})
    }catch(error){
        res.status(201).send({error:error.message})
    }
})

router.post('/users/logoutall',auth, async(req,res) => {
    const user = req.user
    try{
        // remove item [0] to item [(n-1)]
        user.tokens.splice(0,user.tokens.length)
        await user.save()
        res.status(200).send({mesg:'log out all successful'})
    }catch(error){
        res.status(201).send({error:error.message})
    }
})

// update user data
router.put('/users/edit/:id',auth,async(req,res)=>{
    const user = req.user
    const password_t = await bcrypt.hash(req.body.password, 10)
    const update_t = {
        firstname:req.body.firstname,
        lastname:req.body.lastname,
        username:req.body.username,
        email:req.body.email,
        password:password_t,
        updated:Date.now(),
        booked:req.body.booked
    }
    try{
        const t = await User.findByIdAndUpdate(req.params.id,update_t,{new:true})
        if(!t)
            res.status(201).send({error:'Update::transaction not found'})
        user.save()
        res.status(200).send(t)
    }catch(err){
        res.status(201).send({eror:err.message})
    }
})

/************************ Transaction Endpoint ********************************************/

// when you get method you send something move endpoint to /api/hor
// It's Work
router.get('/hor',auth,async (req,res,next) => {
    const user = req.user
    try{
        const hor = await Hor.find()
        res.status(200).send(hor)
    }catch(err){
        res.status(201).send({error:err.message})
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
        res.status(201).json({error:'transaction not found'})
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
        res.status(201).json({error:error.message})
    }
})

// delete Hor
router.delete('/hor/:id' , auth ,async (req,res)=>{
    const user = req.user
    try{
        const t = await Hor.findByIdAndDelete({_id:req.params.id,_uid:user._id})
        res.status(200).json({message:"delete successful!"})
    }catch(err){
        res.status(201).json({eror:err.message})
    }
   
})

// update when you book room
router.put('/hor/:id',auth,async (req,res)=>{
    const user = req.user
    const update_t = {
        name:req.body.name,
        gender:req.body.gender,
        stairs:req.body.stairs
    }
    try{
        const t = await Hor.findByIdAndUpdate(req.params.id,update_t,{new:true})
        if(!t)
            res.status(201).send({error:'Update::transaction not found'})
        res.status(200).send(t)
    }catch(err){
        res.status(201).send({eror:err.message})
    }
})

// router.get("/:uid/hor",(req,res,next)=>{
//     res.json({uid:req.params.uid,hor:hor})
// })


router.post('/book',auth,async (req,res) => {
    const user = req.user
    const t = new Book(req.body)
    t._id = user._id

    try{
        await t.save() 
        res.status(200).json(t)
    }
    catch (error){
        res.status(201).json({error:error.message})
    }
})

router.get('/book/:id',auth, async(req,res,next) => {
    // check transactions
    const user = req.user
    try{
        const t = await Book.find({_id:req.params.id})
        res.status(200).json(t)
    }catch(err){
        res.status(201).json({error:'transaction not found'})
    }
})

router.delete('/book/:id' , auth ,async (req,res)=>{
    const user = req.user
    try{
        const t = await Book.findByIdAndDelete({_id:req.params.id})
        res.status(200).json({message:"delete successful!"})
    }catch(err){
        res.status(201).json({eror:err.message})
    }
   
})
module.exports = router