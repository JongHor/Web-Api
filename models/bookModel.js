const mongoose = require("mongoose")

const bookSchema = new mongoose.Schema({
    _uid:{type:mongoose.ObjectId,required:true},
    userId: {
        type: String,
        required:true
    },
    hor:{
        type: String,
        required:true
    },
    room:{
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