# Midterm Project: Lab Check In Web App
**Deployed at: https://labbies.aries1542.dev/**

## Description

A check-in system for the Smith building's lab assistants (labbies) at Utah Tech to track how often students come in for services. Student's can create an account to sign in, or ask a labbie to sign them in with their D-Number. Signed in labbies can also search logs by date, as well as modify and delete faulty logs.

### Screenshots

!(Sign in screen)[]

!(User home page)[]

!(Labbie home page)[]

!(Labbie log modification page)[]

## Instructions

Demo login for standard user:
    Username: d00444555
    Password: password123
Demo login for admin user:
    Username: d00222333
    Password: password123

## Resources

**Log**

Attributes:
- studentID (string)
- timeIn (integer)
- timeOut (integer)
- class (integer)
- typeHelp (integer)

## Schema

```javascript
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
```


## REST Endpoints

| Name                    | Method | Path               |
|-------------------------|--------|--------------------|
| Retrieve log collection | GET    | /logs             |
| Retrieve log member     | GET    | /logs/*\<id\>*    |
| Create log member       | POST   | /logs             |
| Update log member       | PUT    | /logs/*\<id\>*    |
| Update log member       | PATCH  | /logs/*\<id\>*    |
| Delete log member       | DELETE | /logs/*\<id\>*    |

