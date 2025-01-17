# Midterm Project: Lab Check In Web App
**Deployed at: https://labbiecheckin.onrender.com/**

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

