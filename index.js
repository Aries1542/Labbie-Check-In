const cors = require("cors")
const express = require('express')
const model = require('./model')

const app = express()
app.use(express.urlencoded({extended:false}))
app.use(cors())
app.use(express.static("public"))

app.get("/logs", function (request, response) {

    console.log("query: ", request.query)
    filter = {}
    if (request.query.date) {
        if (request.query.date == "today") {
            var today = new Date()
            today.setHours(0, 0, 0, 0)
            console.log("Today:", today)
            console.log("rn: ", new Date())
            filter.timeIn = { $gte : today.toISOString() }
        }
    }

    model.Log.find(filter).then((logs) => {
        console.log(logs)
        response.json(logs)
    })
})

app.get("/logs/:logID", function (request, response) {
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

app.post("/logs", function (request, response) {
    const newLog = new model.Log({
        timeIn : request.body.timeIn,
        class : request.body.class,
        typeHelp : request.body.typeHelp
    })
    if (request.body.userID) {
        sID = model.User.findOneByID(request.body.userID).then((user) => {
            newLog.user = request.body.userID
            newLog.studentID = user.userName
        })
    } else {
        newLog.studentID = request.body.studentID
    }

    model.Log.findOne({ studentID : newLog.studentID, timeOut : { $exists : false } }).then((log) => {
        console.log("Already signed in, found:", log)
        if (log) {
            response.sendStatus(400)
        }else {
            newLog.save().then(() => {
                response.sendStatus(201)
            }).catch((error) => {
                var errorMessages = {};
                if (error.errors) {
                    for (var fieldName in error.errors) {
                        errorMessages[fieldName] = error.errors[fieldName].message
                    }
                    response.status(422).json(errorMessages)
                }else {
                    response.status(500).json("Unknown error creating log.")
                }
                
            });
        }
    })
})

app.patch("/logs/:logID", function (request, response) {
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

// app.post("/users", function (request, response) {

// })

// app.put("/users/:userID", function (request, response) {

// })

// app.post("/sessions", function (request, response) {

// })

// app.delete("/sessions/:sessionID", function (request, response) {
    
// })


app.listen(8080, function () {
    console.log("Server is running...")
})