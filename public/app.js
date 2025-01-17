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

            registerInput: {
                username: "",
                password: "",
                major: ""
            },

            modifyID: "",
            modifyDelete: false,

            errorMessages: {},

            page: "",

            allClasses: ["CS1030", "CS1400", "CS1410", "CS2420", "CS2450", "CS2810", "CS3005", "CS3310", "SE1400", "SE3200", "IT1100", "IT1200", "IT2300", "IT2400", "Other"],
            typeHelps: ["Pass Off", "Assignment", "Study Group", "Other"],
            times: ["Today", "This Week", "This Month", "All Time"],
            majors: ["Computer Science", "Software Engineering", "Information Technology"],

            user: {
                username: "",
                password: "",
                classes: [],
                major: "",
                permissions: 0
            },

            password: "password",
            passwordInput: ""
        }
    },

    methods: {
        buttonLogIn: function () {
            this.clearErrorMessages();
            this.postSession();
        },

        buttonSwitchToSignUp: function () {
            this.clearErrorMessages();
            this.page = "formSignup";
        },

        buttonSignUp: function () {
            this.clearErrorMessages();
            this.postUsers();
        },

        buttonSwitchToLogIn: function () {
            this.clearErrorMessages();
            this.page = "formLogin";
        },

        buttonLogOut: function () {
            this.deleteSession();
        },

        buttonCheckInStudent: function () {
            this.clearErrorMessages();
            this.postLogs();
        },

        buttonCheckOutStudent: function () {
            this.patchLog();
        },

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
            this.cleanSearchInputs();
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

        cleanSignInInputs: function () {
            this.registerInput.username = "";
            this.registerInput.password = "";
            this.registerInput.major = "";
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

        validateLogIn: function () {
            if (this.registerInput.username == "") {
                this.errorMessages.username = "Please enter a username";
            } else if (!/^d00\d{6}$/i.test(this.registerInput.username)) {
                this.errorMessages.username = "Please enter username in the correct format: d00######";
            }
            if (this.registerInput.password == "") {
                this.errorMessages.password = "Please enter a password";
            }

            if(!this.logIsValid) {
                return false;
            }
            return true;
        },

        validateSignUp: function () {
            this.validateLogIn()
            if (this.registerInput.major == "") {
                this.errorMessages.major = "Please enter a major";
            }
            
            if(!this.logIsValid) {
                return false;
            }
            return true;
        },

        validateDNumber: function () {
            if (this.inputLog.studentID == "") {
                this.errorMessages.studentID = "Please enter a student ID";
                return false;
            } else if (!(/^d00\d{6}$/i.test(this.inputLog.studentID))) {
                this.errorMessages.studentID = "Please enter student ID in the correct format: d00######";
                return false;
            }
            return true;
        },

        validateDNumberCheckOut: function () {
            if (this.inputLog.studentID == "") {
                this.errorMessages.studentID = "Please enter a student ID";
                return false;
            } else if (!/^d00\d{6}$/i.test(this.inputLog.studentID)) {
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
            } else if (!/^d00\d{6}$/i.test(this.inputModify.studentID)) {
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

        postUsers: function () {
            if (!this.validateSignUp()) {
                return;
            }


            var data = "username=" + encodeURIComponent(this.registerInput.username);
            data += "&password=" + encodeURIComponent(this.registerInput.password);
            data += "&major=" + encodeURIComponent(this.registerInput.major)

            // //console.log("sending data to server:", data)
            fetch("/users", {
                method: "POST",
                body: data,
                headers: {
                    "Content-type": "application/x-www-form-urlencoded"
                }
                }).then((response) => {
                    this.clearErrorMessages();
                    if (response.status == 201) {
                        this.postSession();
                    } else if (response.status == 422) {
                        this.errorMessages.server = this.registerInput.username + " already has an account";
                    } else if (response.status >= 400) {
                        this.errorMessages.server = "There was an issue with the request.";
                    }
                    
            });
        },

        getSession: function () {
            //console.log("getting session")
            fetch("/session").then((response) => {
                    if (response.status == 200) {
                        this.user = response.json().then(responseUser => {
                            this.user = responseUser;
                            this.getLogs();
                            if (this.user.permissions == 1) {
                                this.page = "formLabCheckinStudent";
                            } else {
                                this.page = "formLabCheckin";
                            }
                        })
                    } else if (response.status >= 400) {
                        //console.log("No session found");
                        this.page = "formLogin";
                    }
            });
        },

        postSession: function () {
            if (!this.validateLogIn()) {
                return;
            }

            var data = "username=" + encodeURIComponent(this.registerInput.username);
            data += "&password=" + encodeURIComponent(this.registerInput.password);

            //console.log("sending data to server:", data)
            fetch("/session", {
                method: "POST",
                body: data,
                headers: {
                    "Content-type": "application/x-www-form-urlencoded"
                }
                }).then((response) => {
                    this.clearErrorMessages();
                    if (response.status == 201) {
                        this.cleanSignInInputs();
                        this.user = response.json().then(responseUser => {
                            this.user = responseUser;
                            this.getLogs();
                            if (this.user.permissions == 1) this.page = "formLabCheckinStudent";
                            else this.page = "formLabCheckin";
                        })
                    } else if (response.status == 401) {
                        this.errorMessages.server = "Invalid username or password.";
                    } else if (response.status >= 400) {
                        this.errorMessages.server = "Failed.";
                    }
                    
            });
        },

        deleteSession: function () {
            fetch("/session", {
                method: "DELETE"
                }).then((response) => {
                    this.user = {
                        username: "",
                        password: "",
                        classes: [],
                        major: "",
                        permissions: 0
                    };
                    this.logs = [];
                    this.page = "formLogin";
            });
        },

        getLogs: function () {
            filter = {}
            if (this.page != 'formLabLogSearch') {
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

            //console.log(filter)
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
                            // //console.log(typeof(log.timeIn))
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

            var data;
            if (this.user.permissions != 1) data = "studentID=" + encodeURIComponent(this.inputLog.studentID);
            else data = "userid=" + encodeURIComponent(this.user._id);
            data += "&class=" + encodeURIComponent(this.inputLog.class);
            data += "&typeHelp=" + encodeURIComponent(this.inputLog.typeHelp);
            data += "&timeIn=" + encodeURIComponent(timeIn)
            //console.log("sending data to server:", data)
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
                        if (this.user.permissions == 1) this.page = "formLabCheckoutStudent";
                        else this.page = "formLabCheckin";
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

            //console.log("sending data to server:", data)
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
            if (this.user.permissions != 1 && !this.validateDNumber()) {
                return;
            }

            timeOut = new Date();

            var data = "timeOut=" + encodeURIComponent(timeOut);
            var notFound = this.logs.every((log) => {
                if ((this.user.permissions == 1 && log.user._id == this.user._id) || (this.user.permissions != 1 && log.studentID == this.inputLog.studentID))  {
                    fetch("/logs/" + log._id, {
                        method: "PATCH",
                        body: data
                    }).then((response) => {
                        
                        this.clearErrorMessages();
                        if (response.status == 200) {
                            this.cleanInputs();
                            this.getLogs();
                            if (this.user.permissions == 1) this.page = "formLabCheckinStudent";
                        }
                        else if (response.status == 400) {
                            this.errorMessages.checkOut = "Student with ID ' " + this.inputLog.studentID + " ' is not currently checked in.";
                        } else if (response.status > 400) {
                            this.errorMessages.server = "There was an issue with the request.";
                        }
                        
                        return false;
                    })
                }else {
                    return true;
                }
            });

            //console.log(notFound);

            if (notFound) {
                this.errorMessages.checkOut = "Student with ID ' " + this.inputLog.studentID + " ' is not currently checked in.";
            }

        },

        isSelected: function (log) {
            return log._id == this.modifyID;
        }
        
    },

    computed: {
        logIsValid: function () {
            return Object.keys(this.errorMessages).length <= 0;
        },
    },

    created: function () {
        //console.log("Hello, Vue.");
        this.user.classes = this.allClasses;
        this.getSession()
        // this.getLogs();
    }
}).mount("#app");