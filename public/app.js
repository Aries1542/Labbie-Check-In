Vue.createApp({

    data: function () {
        return {
            logs: [],
            
            inputLog: {
                studentID: "",
                class: "",
                typeHelp: ""
            },

            searchParams: {
                date: "",
                class: "",
                typeHelp: ""
            },

            inputModify: {
                studentID: "",
                timeIn: "",
                timeOut: "",
                class: "",
                typeHelp: ""
            },

            modifyID: "",
            modifyDelete: false,

            errorMessages: {},

            page: "formLabCheckin",

            classes: ["CS1030", "CS1400", "CS1410", "CS2420", "CS2450", "CS2810", "CS3005", "CS3310", "SE1400", "SE3200", "IT1100", "IT1200", "IT2300", "IT2400", "Other"],
            typeHelps: ["Pass Off", "Assignment", "Study Group", "Other"],
            times: ["Today", "This Week", "This Month", "All Time"],

            password: "password",
            passwordInput: ""
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
            this.cleanInputs();
            this.clearErrorMessages();
            this.page = "formLabCheckin";
        },

        buttonCheckOut: function () {
            this.patchLog();
        },

        buttonSearch: function () {
            this.getLogs();
        },

        buttonSearchClear: function () {
            this.getLogs();
        },

        buttonAuthenticate: function () {
            if (this.passwordInput == this.password) {
                this.passwordInput = "";
                this.clearErrorMessages();
                this.page = "formLabLogSearch";
                this.getLogs();
            } else {
                this.passwordInput = "";
                this.errorMessages.auth = "The password entered was incorrect."
            }
            
        },

        buttonAuthenticateCancel: function () {
            this.clearErrorMessages();
            this.buttonSwitchPageBack();
        },

        buttonErrorClose: function () {
            this.clearErrorMessages();
        },

        buttonSwitchPageToSearch: function () {
            this.cleanInputs();
            this.cleanSearchInputs();
            this.page = "formSearchAuth";
            this.getLogs();
        },

        buttonSwitchPageBack: function () {
            this.cleanInputs();
            this.cleanSearchInputs();
            this.page = "formLabCheckin";
            this.getLogs();
        },

        deleteLogModal: function () {
            this.modifyDelete = true;
        },

        confirmDelete: function () {
            this.modifyDelete = false;
            this.deleteLog()
        },

        cancelDelete: function () {
            this.modifyDelete = false;
        },

        cleanInputs: function () {
            this.inputLog.studentID = "";
            this.inputLog.class = "";
            this.inputLog.typeHelp = "";
        },

        cleanSearchInputs: function () {
            this.searchParams.date = "";
            this.searchParams.class = "";
            this.searchParams.typeHelp = "";
        },

        cleanModify: function () {
            this.modifyID = "";
            this.inputModify.studentID = "";
            this.inputModify.timeIn = "";
            this.inputModify.timeOut = "";
            this.inputModify.class = "";
            this.inputModify.typeHelp = "";
        },

        setModify: function (log) {
            this.modifyID = log._id;
            this.inputModify.studentID = log.studentID;
            this.inputModify.timeIn = log.timeIn;
            this.inputModify.timeOut = log.timeOut;
            this.inputModify.class = log.class;
            this.inputModify.typeHelp = log.typeHelp;
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

        validateModify: function () {
            if (this.inputModify.studentID == "") {
                this.errorMessages.studentID = "Please enter a student ID";
            } else if ((this.inputModify.studentID.substring(0, 3) != "d00" && this.inputModify.studentID.substring(0, 3) != "D00") || this.inputModify.studentID.length != 9) {
                this.errorMessages.studentID = "Please enter student ID in the correct format: d00######";
            }
            if (this.inputModify.class == "") {
                this.errorMessages.class = "Please enter a class";
            }
            if (this.inputModify.typeHelp == "") {
                this.errorMessages.typeHelp = "Please enter a type of help";
            }
            if (this.inputModify.timeIn == "") {
                this.errorMessages.timeIn = "Please enter a student ID";
            } else if (Date.parse(this.inputModify.timeIn) == NaN) {
                this.errorMessages.timeIn = "Please enter a the time in in a proper format";
            }
            if (this.inputModify.timeOut != "" && Date.parse(this.inputModify.timeOut) == NaN) {
                this.errorMessages.timeIn = "Please enter a the time out in a proper format";
            }

            if (!this.logIsValid) {
                return false;
            }
            return true;
                
        },

        clearErrorMessages: function () {
            this.errorMessages = {};
        }, 

        getLogs: function () {
            filter = {}
            if (this.page == 'formLabCheckin' || this.page == 'formLabCheckin2') {
                filter.date = 'today';
            }else if (this.page == 'formLabLogSearch') {
                if (this.searchParams.date) {
                    switch (this.searchParams.date) {
                        case "Today": filter.date = 'today'; break;
                        case "This Week": filter.date = 'week'; break;
                        case "This Month": filter.date = 'month'; break;
                    }
                }
                if (this.searchParams.class) {
                    filter.class = this.searchParams.class;
                }
                if (this.searchParams.typeHelp) {
                    filter.typeHelp = this.searchParams.typeHelp;
                }
            }

            console.log(filter)
            queryString = new URLSearchParams(filter);

            fetch("/logs?" + queryString).then((response) => {
                if (response.status == 200) {
                    response.json().then((serverLogs) => {
                         ("received logs from API: ", serverLogs);
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

        // getLog: function (logID) {
        //     fetch("/logs/" + logID).then((response) => {
        //         if (response.status == 200) {
        //             response.json().then((serverLog) => {
        //                 return serverLog;
        //             });
        //         }
        //     });
        // },

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
                        this.cleanInputs();
                        this.page = "formLabCheckin";
                    } else if (response.status == 400) {
                        this.errorMessages.server = "This student is already checked in.";
                    } else if (response.status == 422) {
                        this.errorMessages.server = "Not enough data to create a log. Please make sure all required fields are filled out.";
                    } else if (response.status > 400) {
                        this.errorMessages.server = "There was an issue with the request.";
                    }
                    
            });
        },

        putLog: function () {
            if (!this.validateModify()) {
                return;
            }

            var data = "studentID=" + encodeURIComponent(this.inputModify.studentID);
            data += "&class=" + encodeURIComponent(this.inputModify.class);
            data += "&typeHelp=" + encodeURIComponent(this.inputModify.typeHelp);
            data += "&timeIn=" + encodeURIComponent(this.inputModify.timeIn);
            if (this.inputModify.timeOut) {
                data += "&timeOut=" + encodeURIComponent(this.inputModify.timeOut);
            }

            console.log("sending data to server:", data)
            fetch("/logs/" + this.modifyID, {
                method: "PUT",
                body: data,
                headers: {
                    "Content-type": "application/x-www-form-urlencoded"
                }
                }).then((response) => {
                    this.clearErrorMessages();
                    if (response.status == 200) {
                        this.getLogs();
                        this.cleanModify();
                        this.page = "formLabLogSearch";
                    } else if (response.status > 400) {
                        this.errorMessages.server = "There was an issue with the request.";
                    }  
            });
        },

        deleteLog: function () {
            fetch("/logs/" + this.modifyID, {
                method: "DELETE"
                }).then((response) => {
                    this.clearErrorMessages();
                    if (response.status == 200) {
                        this.getLogs();
                        this.cleanModify();
                        this.page = "formLabLogSearch";
                    } else if (response.status > 400) {
                        this.errorMessages.server = "There was an issue with the request.";
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
                            this.cleanInputs();
                            this.getLogs();
                        }
                        else if (response.status == 400) {
                            this.errorMessages.checkOut = "Student is not currently checked in."
                        } else if (response.status > 400) {
                            this.errorMessages.server = "There was an issue with the request.";
                        }
                        
                        return false;
                    })
                }else {
                    return true;
                }
            });
        },

        isSelected: function (log) {
            return log._id == this.modifyID;
        }
        
    },

    computed: {
        logIsValid: function () {
            return Object.keys(this.errorMessages).length <= 0;
        },

        // inputModify: function () {
        //     return this.logs.find((log) => log.studentID == this.modifyID);
        // }
    },

    created: function () {
        console.log("Hello, Vue.")
        this.getLogs();
    }
}).mount("#app");