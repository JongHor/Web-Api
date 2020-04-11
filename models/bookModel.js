const mongoose = require("mongoose")

const bookSchema = new mongoose.Schema({
    userId: {
        type: String,
        required:true
    },
    horId:{
        type: String,
        required:true
    },
    roomId:{
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