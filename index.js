const cors = require("cors")
const express = require("express")
const model = require("./model")
const session = require('express-session')


const app = express()
app.use(express.urlencoded({extended:false}))
app.use(cors(
//     {
//     credentials: true,
//     origin: function (origin, callback) {
//         callback(null, origin) // avoid using the wildcard origni
//     }
// }
))
app.use(express.static("public"))
app.use(session({ //settings
    secret: "nkfcfkfmfkmomoKDCVO30MVVKVRMV4I29904",
    saveUninitialized: true,
    resave: false,
    // cookie: {
    //     secure: true,
    //     sameSite: 'None'
    // }
}))


// notes on sessions setup
// docs in assignment description
// app.use(session({
//      settings
// }))
// settings:
//  secret: secret salt only known by the server, prevents tampering
//  saveUninitialized: 
//  resave:

//my middleware
function authorizeRequest(permissionsRequired) {
    // admin permissions: 3
    // labbie permissions: 2
    // student permissions: 1
    // public permissions: 0

    return function(request, response, next) {
        if (request.session && request.session.userID) {
            model.User.findById(request.session.userID).then(function (user) {
                if (!user) {
                    response.sendStatus(404)
                }
                if (user.permissions >= permissionsRequired) {
                    request.user = user
                    next()
                }else {
                    response.sendStatus(401);
                }
            })
        } else {
            response.sendStatus(401);
        }
    }
}

app.get("/logs", authorizeRequest(0), function (request, response) {
    console.log("session: ", request.session)
    // console.log("query: ", request.query)
    filter = {}
    if (request.query.date) {
        if (request.query.date == "today") {
            var searchDate = new Date()
            searchDate = new Date(searchDate.getFullYear(), searchDate.getMonth(), searchDate.getDate())
            filter.timeIn = { $gte : searchDate.toISOString() }
        }else if (request.query.date == "week") {
            var searchDate = new Date()
            var firstOfWeek = searchDate.getDate() - searchDate.getDay()
            searchDate = new Date(searchDate.getFullYear(), searchDate.getMonth(), firstOfWeek)
            filter.timeIn = { $gte : searchDate.toISOString() }
        }else if (request.query.date == "month") {
            var searchDate = new Date()
            searchDate = new Date(searchDate.getFullYear(), searchDate.getMonth(), 1)
            filter.timeIn = { $gte : searchDate.toISOString() }
        }else if (request.query.date == "year") {
            var searchDate = new Date()
            searchDate = new Date(searchDate.getFullYear(), 0)
            filter.timeIn = { $gte : searchDate.toISOString() }
        }
    }
    if (request.query.class) {
        filter.class = request.query.class
    }
    if (request.query.typeHelp) {
        filter.typeHelp = request.query.typeHelp
    }
    if (request.user.permissions == 1) {
        filter.user = request.user._id
    }

    model.Log.find(filter).populate('user').then((logs) => {
        console.log("returning:", logs)
        response.json(logs)
    })
})

app.get("/logs/:logID", authorizeRequest(0), function (request, response) { 
    model.Log.findById(request.params.logID).then((log) => {
        if (!log) {
            response.sendStatus(404)
        }else {
            response.json(log)
        }  
    }).catch((error) => {
        console.log("Bad Input for GET /logs")
        response.sendStatus(404)
    })
})

app.post("/logs", authorizeRequest(0), function (request, response) {
    const newLog = new model.Log({
        timeIn : request.body.timeIn,
        class : request.body.class,
        typeHelp : request.body.typeHelp
    })
    if (request.user.permissions == 1) {
        newLog.user = request.user._id
        newLog.studentID = request.user.username
    } else {
        newLog.studentID = request.body.studentID
    }

    filter = { studentID : newLog.studentID, timeOut : { $exists : false } }
    update = [{ $set : { timeOut : "$timeIn" } }]
    model.Log.updateMany(filter, update).then(() => {
        
        newLog.save().then(() => {
            response.sendStatus(201)
        }).catch((error) => {
            var errorMessages = {}
            if (error.errors) {
                for (var fieldName in error.errors) {
                    errorMessages[fieldName] = error.errors[fieldName].message
                }
                response.status(422).json(errorMessages)
            }else {
                response.status(500).json("Unknown error creating log.")
            }
        })
        
    })
})

app.patch("/logs/:logID", authorizeRequest(0), function (request, response) {
    model.Log.findById(request.params.logID).then((log) => {
        if (!log) {
            response.sendStatus(404)
        }
        if (log.timeOut) {
            response.sendStatus(400)
        }else {
            log.timeOut = new Date()
            log.save().then(() => {
            response.sendStatus(200)
        })
        }  
    }).catch((error) => {
        console.log("Bad Input for PATCH /logs")
        response.sendStatus(404)
    })
})

app.delete("/logs/:logID", authorizeRequest(2), function (request, response) {
    model.Log.findByIdAndDelete(request.params.logID).then((log) => {
        if (!log) {
            response.sendStatus(404)
        }else {
            response.sendStatus(200)
        }
    }).catch((error) => {
        console.log("Bad Input for DELETE /logs")
        response.sendStatus(404)
    })
})

app.put("/logs/:logID", authorizeRequest(2), function (request, response) {
    const newLog = new model.Log({
        _id : request.params.logID,
        timeIn : request.body.timeIn,
        class : request.body.class,
        typeHelp : request.body.typeHelp
    })
    if (request.body.timeOut) {
        newLog.timeOut = request.body.timeOut
    }
    if (request.body.userID) {
        model.User.findById(request.body.userID).then((user) => {
            newLog.user = request.body.userID
            newLog.studentID = user.username
        })
    } else {
        newLog.studentID = request.body.studentID
    }

    if (!newLog.timeIn || !newLog.class || !newLog.typeHelp || !newLog.studentID) {
        response.sendStatus(422)
    } else {
        model.Log.findOneAndReplace({ _id : request.params.logID }, newLog).then((log) => {
            if (!log) {
                response.sendStatus(404)
            }else {
                response.sendStatus(200)
            }
        }).catch((error) => {
            console.log("Bad Input for PUT /logs")
            response.sendStatus(404)
        })
    }    
})

app.get("/users", authorizeRequest(3), function (request, response) {
    filter = {}
    if (request.query.permissions) {
        filter.permissions = request.query.permissions
    }
    if (request.query.major) {
        filter.major = request.query.major
    }

    model.User.find(filter).then((users) => {
        // console.log(logs)
        response.json(users)
    })
})

app.post("/users", function (request, response) {

    const newUser = new model.User({
        username : request.body.username,
        major : request.body.major,
        permissions : 1
    })

    if (request.body.classes) {
        newUser.classes = request.body.classes
    } else {
        newUser.classes = []
    }

    newUser.setEncryptedPassword(request.body.password).then(function () {
        newUser.save().then(() => {
            response.sendStatus(201)
        }).catch((error) => {
            var errorMessages = {};
            if (error.errors) {
                for (var fieldName in error.errors) {
                    errorMessages[fieldName] = error.errors[fieldName].message
                }
                response.status(422).json(errorMessages)
            }else if (error.code == 11000) {
                response.status(422).json({ username : request.body.username + " already has an account" })
            } else{
                response.status(500).json("Unknown error creating user.")
            }
            
        })
    })
})

app.put("/users", authorizeRequest(1), function (request, response) {
    const newUser = new model.User({
        _id : request.user._id,
        username : request.body.username,
        major : request.body.major,
        classes : request.body.classes,
        permissions : request.user.permissions
    })

    newUser.setEncryptedPassword(request.body.password).then(function () {
        model.User.findOneAndReplace({ _id : request.user._id }, newUser).then((user) => {
            response.sendStatus(200)
        })
    })

})

// app.get("/classes", authorizeRequest(1), function(request, response) {
//     model.User.findById(request.user._id).then((user) => {
//         response.json(user.classes)
//     })
// })
//
// app.post("/classes", authorizeRequest(1), function(request, response) {
//     model.User.findByIdAndUpdate(request.user._id, { $addToSet : { classes : request.body.class }}).then((user) => {
//         response.sendStatus(201)
//     })
// })
//
// app.delete("/classes", authorizeRequest(1), function(request, response) {
//     model.User.findByIdAndUpdate(request.user._id, { $pull : { classes : request.body.class }}).then((user) => {
//         response.sendStatus(200)
//     })
// })

app.get("/session", authorizeRequest(0), function (request, response) {
    response.status(200).send(request.user)
})

app.delete("/session", authorizeRequest(0), function (request, response) {
    request.session.userID = null
    response.status(200).send("Logged out")
})

app.post("/session", function (request, response) {
    //get credentials
    //find user by username
    //if email found:
    //  if password verifies:
    //      201 response
    //  else:
    //      401 response
    //else:
    //  401 response
    model.User.findOne({username : request.body.username}).then(function (user) {
        if (user) {
            user.verifyEncryptedPassword(request.body.password).then(function (match) {
                if (match) {
                    // request.session.whateveryouwant = something useful
                    request.session.userID = user._id
                    response.status(201).send(user);
                }else {
                    response.sendStatus(401);
                }
            })
        } else {
            response.sendStatus(401);
        }
        
    })
})

app.post("/students", authorizeRequest(3), function(request, response) {
    model.User.findByIdAndUpdate(request.body.userID, { permissions : 1 }).then((user) => {
        if (!user) {
            response.sendStatus(404)
        }else {
            response.sendStatus(201)
        }
        
    })
})

app.post("/labbies", authorizeRequest(3), function(request, response) {
    model.User.findByIdAndUpdate(request.body.userID, { permissions : 2 }).then((user) => {
        if (!user) {
            response.sendStatus(404)
        }else {
            response.sendStatus(201)
        }
    })
})

app.post("/admins", authorizeRequest(3), function(request, response) {
    model.User.findByIdAndUpdate(request.body.userID, { permissions : 3 }).then((user) => {
        if (!user) {
            response.sendStatus(404)
        }else {
            response.sendStatus(201)
        }
    })
})



app.listen(8080, function () {
    console.log("Server is running...")
})