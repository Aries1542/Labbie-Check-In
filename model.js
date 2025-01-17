const mongoose = require('mongoose');
const bcrypt = require('bcrypt')
const { stringify } = require('querystring');
mongoose.connect('mongodb+srv://d00469548:lHQZ8qrFRKqJp4GJ@cluster0.4fh5oqe.mongodb.net/labbieLogs?retryWrites=true&w=majority');


const userSchema = new mongoose.Schema({
    username : {
        type: String,
        required: [true, "Username is required"],
        match: [/^d00\d{6}$/i, "Username must match format d00######, where each # is a single digit"],
        lowercase: true,
        unique: true //database constraint, not a mongoose validator
    },
    passwordHash: {
        type: String,
        required: [true, "Password is required"]
    },
    major : {
        type : String,
        required: [true, "Major is required"]
    },
    classes : [String],
    // role : {
    //     type : String,
    //     enum: {values : ["public", "user", "labbie", "admin"], message : "User role must be one of the following: public, user, labbie, admin"},
    //     required : true
    // },
    permissions : {  
    // admin permissions: 3
    // labbie permissions: 2
    // student permissions: 1
    // public permissions: 0
        type : Number,
        min: [0, "User role must be >= 0 && <= 3"],
        max: [3, "User role must be >= 0 && <= 3"],
        required : true
    }
    
}, {
    versionKey: false,
    toJSON: {
        transform: function (doc, ret) {
            delete ret.passwordHash
        }
    }
})

userSchema.methods.setEncryptedPassword = function (inputPassword) {
    // encrypt a plaintext inputPassword to store in the database
    var promise = new Promise((resolve, reject) => {
        //resolve is the .then() function
        //reject is the .catch() function
        bcrypt.hash(inputPassword, 12).then((hash) => {
            // Store hash in your password DB.
            this.passwordHash = hash
            resolve()
        })
    })

    return promise
}

userSchema.methods.verifyEncryptedPassword = function (inputPassword) {
    // verify plaintext inputPassword with stored passwordHash
    var promise = new Promise((resolve, reject) => {
        bcrypt.compare(inputPassword, this.passwordHash).then((result) => {
            resolve(result)
        })
    })

    return promise
    
}

//WARNING TODO: remember to return to PROD tables before push
const User = mongoose.model('TESTUser', userSchema)

const logSchema = new mongoose.Schema({
    user : {
        type: mongoose.Schema.Types.ObjectId,
        ref: User
    },
    studentID : {
        type: String,
        required: [true, "Student ID is required"],
        lowercase: true,
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