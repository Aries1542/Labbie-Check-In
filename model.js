const mongoose = require('mongoose');
const { stringify } = require('querystring');
mongoose.connect('mongodb+srv://d00469548:lHQZ8qrFRKqJp4GJ@cluster0.4fh5oqe.mongodb.net/labbieLogs?retryWrites=true&w=majority');


const userSchema = new mongoose.Schema({
    userName : {
        type: String,
        required: [true, "Username is required"], 
        unique: true
    },
    password : {
        type: String,
        required: [true, "Password is required"]
    },
    major : String,
    classes : [String],
    admin : {
        type : Boolean,
        required : true
    }
}, {versionKey: false})

//WARNING TODO: remember to return to PROD tables before push
const User = mongoose.model('TESTUser', userSchema)

const logSchema = new mongoose.Schema({
    user : {type: mongoose.Schema.Types.ObjectId, ref: User},
    studentID : {
        type: String,
        required: [true, "Student ID is required"],
        match: /^d00/i
    },
    timeIn : {
        type : Date,
        required: [true, "Time in is required"]
    },
    timeOut : Date,
    class : {
        type : String,
        required : [true, "Class is required"]
    },
    typeHelp : {
        type : String,
        required : [true, "Type of Help is required"]
    }
}, {versionKey: false})

//WARNING TODO: remember to return to PROD tables before push
const Log = mongoose.model('TESTLog', logSchema);

module.exports = {
    Log : Log,
    User : User
}