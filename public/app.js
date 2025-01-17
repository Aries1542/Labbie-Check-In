Vue.createApp({

    data: function () {
        return {
            logs: [],
            
            inputLog: {
                studentID: "",
                class: "",
                typeHelp: ""
            },

            errorMessages: {},

            page: "formLabCheckin"
        }
    },

    methods: {
        buttonCheckIn: function () {
            if (this.validateDNumber()) {;
                this.page = "formLabCheckin2"
                this.clearErrorMessages();
            }
        },

        buttonConfirm: function () {
            this.postLogs();
        },

        buttonCancel: function () {
            this.inputLog.studentID = "";
            this.inputLog.class = "";
            this.inputLog.typeHelp = "";
            this.clearErrorMessages();
            this.page = "formLabCheckin";
        },

        buttonCheckOut: function () {
            this.patchLog();
        },

        buttonErrorClose: function () {
            this.clearErrorMessages();
        },

        validateDNumber: function () {
            if (this.inputLog.studentID == "") {
                this.errorMessages.studentID = "Please enter a student ID";
                return false;
            } else if ((this.inputLog.studentID.substring(0, 3) != "d00" && this.inputLog.studentID.substring(0, 3) != "D00") || this.inputLog.studentID.length != 9) {
                this.errorMessages.studentID = "Please enter student ID in the correct format: d00######";
                return false;
            }
            return true;
        },

        validateDNumberCheckOut: function () {
            if (this.inputLog.studentID == "") {
                this.errorMessages.studentID = "Please enter a student ID";
                return false;
            } else if ((this.inputLog.studentID.substring(0, 3) != "d00" && this.inputLog.studentID.substring(0, 3) != "D00") || this.inputLog.studentID.length != 9) {
                this.errorMessages.studentID = "Please enter student ID in the correct format: d00######";
                return false;
            }
            return true;
        },

        validateCheckIn: function () {
            if (this.inputLog.class == "") {
                this.errorMessages.class = "Please enter a class";
            }
            if (this.inputLog.typeHelp == "") {
                this.errorMessages.typeHelp = "Please enter a type of help";
            }

            if (!this.logIsValid) {
                return false;
            }
            return true;
        },

        clearErrorMessages: function () {
            this.errorMessages = {};
        }, 

        // errorMessageForField: function (field) {

        // },

        // errorStyleForField: function (field) {
        //     if (this.errorMessageForField(field)) {
        //         return {color : red};
        //     } else {
        //         return;
        //     }
        // },

        getLogs: function () {
            fetch("/logs?date=today").then((response) => {
                if (response.status == 200) {
                    response.json().then((serverLogs) => {
                        console.log("received logs from API: ", serverLogs);
                        serverLogs.forEach((log) => {
                            // log.timeIn = log.timeIn.toLocaleTimeString();
                            if (log.timeIn) {
                                log.timeIn = new Date(log.timeIn.replace("T"," ").replace(/-/g,"/"));
                            }
                            if (log.timeOut) {
                                log.timeOut = new Date(log.timeOut.replace("T"," ").replace(/-/g,"/"));
                            }
                            // console.log(typeof(log.timeIn))
                        });
                        serverLogs.sort((logA, logB) => {
                            return logB.timeIn - logA.timeIn;
                        });

                        this.logs = serverLogs;
                    });
                }
            });
        },

        postLogs: function () {
            if (!this.validateCheckIn()) {
                return;
            }

            timeIn = new Date();

            var data = "studentID=" + encodeURIComponent(this.inputLog.studentID);
            data += "&class=" + encodeURIComponent(this.inputLog.class);
            data += "&typeHelp=" + encodeURIComponent(this.inputLog.typeHelp);
            data += "&timeIn=" + encodeURIComponent(timeIn)
            console.log("sending data to server:", data)
            fetch("/logs", {
                method: "POST",
                body: data,
                headers: {
                    "Content-type": "application/x-www-form-urlencoded"
                }
                }).then((response) => {
                    this.clearErrorMessages();
                    if (response.status == 201) {
                        this.getLogs();
                        this.inputLog.studentID = "";
                        this.inputLog.class = "";
                        this.inputLog.typeHelp = "";
                        this.page = "formLabCheckin";
                    } else if (response.status >= 400) {
                        this.errorMessages.server = "There was an issue with the request. This student may already be checked in.";
                    }
                    
            });
        },

        patchLog: function () {
            if (!this.validateDNumber()) {
                return;
            }

            timeOut = new Date();

            var data = "timeOut=" + encodeURIComponent(timeOut);
            this.logs.every((log) => {
                if (log.studentID == this.inputLog.studentID)  {
                    fetch("/logs/" + log._id, {
                        method: "PATCH",
                        body: data
                    }).then((response) => {
                        
                        this.clearErrorMessages();
                        if (response.status == 200) {
                            this.inputLog.studentID = "";
                            this.getLogs();
                        }
                        else if (response.status == 400) {
                            this.errorMessages.checkOut = "Student is not currently checked in."
                        }
                        
                        return false;
                    })
                }else {
                    return true;
                }
            });
        }
        
    },

    computed: {
        logIsValid: function () {
            return Object.keys(this.errorMessages).length <= 0;
        }
    },

    created: function () {
        console.log("Hello, Vue.")
        this.getLogs();
    }
}).mount("#app");