const mongoose = require("mongoose")

const horSchema = new mongoose.Schema({
    _uid:{type:mongoose.ObjectId,required:true},
    name: {
        type: String,
        required:true
    },
    gender:{
        type: String,
        required:true
    },
    stairs:[{stair:{type: Number, required:true},rooms:[{
        room:{type: Number, required:true},
        booked:{type: Boolean, required:true,
        default:false}
}
]}],
    created:{
        type:Date,
        required:true,
        default:Date.now
    },
})


//.model(export-name,schema,collection-name) 
module.exports = mongoose.model('Hor',horSchema)