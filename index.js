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

app.delete("/logs/:logID", function (request, response) {
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

app.put("/logs/:logID", function (request, response) {
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
        model.User.findOneByID(request.body.userID).then((user) => {
            newLog.user = request.body.userID
            newLog.studentID = user.userName
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


app.listen(8080, function () {
    console.log("Server is running...")
})