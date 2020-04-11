const mongoose = require("mongoose")

const bookSchema = new mongoose.Schema({
    _id:{type:mongoose.ObjectId,required:true},
    horId:{
        type: Number,
        required:true
    },
    roomId:{
        type:Number,
        required:true
    },
    roomNum:{
        type:Number,
        required:true
    },
    horName:{
        type:Number,
        required:true
    },
    created:{
        type:Date,
        required:true,
        default:Date.now
    }
})

//.model(export-name,schema,collection-name) 
module.exports = mongoose.model('Book',bookSchema)