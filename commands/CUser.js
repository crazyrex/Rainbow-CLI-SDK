"use strict";

const NodeSDK = require('../common/SDK');
const Message = require('../common/Message');
const Exit = require('../common/Exit');

class CUser {

    constructor(prefs) {
        this._prefs = prefs;
    }

    _getUsers(token, options) {

        let that = this;

        return new Promise(function(resolve, reject) {

            var filterToApply = "format=full";

            if(options.format) {
                filterToApply = "format=" + options.format;
            }

            if(options.page > 0) {
                filterToApply += "&offset=";
                if(options.page > 1) {
                    filterToApply += (options.limit * (options.page - 1));
                }
                else {
                    filterToApply +=0;
                }
            }

            filterToApply += "&limit=" + Math.min(options.limit, 1000);

            if (options.companyId) {
                filterToApply += "&companyId=" + options.companyId;
            } else {
                if (that._prefs.user.adminType === "company_admin") {
                    // Limit company_admin to only their company (sandbox)
                    filterToApply += "&companyId=" + that._prefs.user.companyId;
                } else if (that._prefs.user.adminType === "organization_admin") {
                    // Limit organization_admin to only their organization (sandbox)
                    filterToApply += "&organisationId=" + that._prefs.user.organisationId;
                }
            }

            if(options.name) {
                filterToApply += "&displayName=" + options.name;
            }

            if(options.company) {
                filterToApply += "&companyName=" + options.company;
            }

            if(options.onlyTerminated) {
                filterToApply += "&isTerminated=true";
            }
            else {
                filterToApply += "&isTerminated=false";
            }

            NodeSDK.get('/api/rainbow/admin/v1.0/users?' + filterToApply, token).then(function(json) {
                resolve(json);
            }).catch(function(err) {
                reject(err);
            });
        });
    }

    _create(token, data) {

        return new Promise(function(resolve, reject) {
            NodeSDK.post('/api/rainbow/admin/v1.0/users', token, data).then(function(json) {
                resolve(json);
            }).catch(function(err) {
                reject(err);
            });
        });
    }

    _changepwd(token, id, password) {

        let data = {
            password: password
        };
        
        console.log("id", id, password, data);
        return new Promise(function(resolve, reject) {
            NodeSDK.put('/api/rainbow/admin/v1.0/users/' + id, token, data).then(function(json) {
                resolve(json);
            }).catch(function(err) {
                reject(err);
            });
        });
    }

    _delete(token, id) {

        return new Promise(function(resolve, reject) {
            NodeSDK.delete('/api/rainbow/admin/v1.0/users/' + id, token).then(function(json) {
                resolve(json);
            }).catch(function(err) {
                reject(err);
            });
        });
    }

    _getUser(token, id) {

        return new Promise(function(resolve, reject) {

            NodeSDK.get('/api/rainbow/admin/v1.0/users/' + id, token).then(function(json) {
                resolve(json);
            }).catch(function(err) {
                reject(err);
            });
        });
    }

    _createSimple(token, email, password, firstname, lastname, options) {

        var user = {
            loginEmail: email,
            password: password,
            firstName: firstname,
            lastName: lastname,
            isActive: true,
            isInitialized: false,
            language: "en",
            adminType: "undefined",
            roles: ["user"],
            accountType: "free",
        };

        if(options.companyId) {
            user.companyId = options.companyId;
        }

        if(options.isAdmin) {
            user.roles.push("admin")
            user.adminType = ["company_admin"];
        }

        return this._create(token, user);
    }

    getUsers(options) {
        var that = this;

        Message.welcome(options);

        if(this._prefs.token && this._prefs.user) {
            Message.loggedin(this._prefs.user, options);

            if(!options.csv) {
                Message.action("List users", null, options);
            }
            
            let spin = Message.spin(options);
            NodeSDK.start(this._prefs.email, this._prefs.password, this._prefs.host).then(function() {
                Message.log("execute action...");
                return that._getUsers(that._prefs.token, options, that._prefs);
            }).then(function(json) {
                
                Message.unspin(spin);
                Message.log("action done...", json);

                if(options.csv) {
                    Message.csv(options.csv, json.data).then(() => {
                    }).catch((err) => {
                        Exit.error();
                    });
                }
                else if(options.noOutput) {
                    Message.out(json.data);
                }
                else {

                    if(json.total > json.limit) {
                        Message.tablePage(json, options);
                    }
                    Message.lineFeed();
                    Message.tableUsers(json, options);
                }
                Message.log("finished!");

            }).catch(function(err) {
                Message.unspin(spin);
                Message.error(err, options);
                Exit.error();
            });
        }
        else {
            Message.notLoggedIn(options);
            Exit.error();
        }
    }

    create(email, password, firstname, lastname, options) {
        var that = this;
        
        Message.welcome(options);
                
        if(this._prefs.token && this._prefs.user) {
            Message.loggedin(this._prefs.user, options);
            Message.action("Create new user", email, options);

            let spin = Message.spin(options);
            NodeSDK.start(this._prefs.email, this._prefs.password, this._prefs.host).then(function() {
                Message.log("execute action...");
                return that._createSimple(that._prefs.token, email, password, firstname, lastname, options);
            }).then(function(json) {
                Message.unspin(spin);
                Message.log("action done...", json);

                if(options.noOutput) {
                    Message.out(json.data);
                }
                else {
                    Message.lineFeed();
                    Message.printSuccess('User created with Id', json.data.id, options);    
                    Message.success(options);
                }
                Message.log("finished!");
                
            }).catch(function(err) {
                Message.unspin(spin);
                Message.error(err, options);
                Exit.error();
            });
        }
        else {
            Message.notLoggedIn(options);
            Exit.error();
        }
    }

    changepwd(id, password, options) {
        var that = this;
        
        Message.welcome(options);
                
        if(this._prefs.token && this._prefs.user) {
            Message.loggedin(this._prefs.user, options);
            Message.action("Change password of user", id, options);

            let spin = Message.spin(options);
            NodeSDK.start(this._prefs.email, this._prefs.password, this._prefs.host).then(function() {
                Message.log("execute action...");
                return that._changepwd(that._prefs.token, id, password, options);
            }).then(function(json) {
                Message.unspin(spin);
                Message.log("action done...", json);

                if(options.noOutput) {
                    Message.out(json.data);
                }
                else {
                    Message.lineFeed();
                    Message.printSuccess('Password changed for user', json.data.id, options);    
                    Message.success(options);
                }
                Message.log("finished!");
                
            }).catch(function(err) {
                Message.unspin(spin);
                Message.error(err, options);
                Exit.error();
            });
        }
        else {
            Message.notLoggedIn(options);
            Exit.error();
        }
    }

    delete(id, options) {
        var that = this;

        var doDelete = function(id) {
            Message.action("Delete user", id, options);

            let spin = Message.spin(options);
            NodeSDK.start(that._prefs.email, that._prefs.password, that._prefs.host).then(function() {
                Message.log("execute action...");
                return that._delete(that._prefs.token, id);
            }).then(function(json) {
                Message.unspin(spin);
                Message.log("action done...", json);
                Message.lineFeed();
                Message.success(options);
                Message.log("finished!");
            }).catch(function(err) {
                Message.unspin(spin);
                Message.error(err, options);
                Exit.error();
            });
        }
        
        Message.welcome(options);
                
        if(this._prefs.token && this._prefs.user) {
            Message.loggedin(this._prefs.user, options);

            if(options.noconfirmation) {
                doDelete(id);
            }
            else {
                Message.confirm('Are-you sure ? It will remote it completely').then(function(confirm) {
                    if(confirm) {
                        doDelete(id);
                    }
                    else {
                        Message.canceled(options);
                        Exit.error();
                    }
                });
            }
        }
        else {
            Message.notLoggedIn(options);
            Exit.error();
        }
    }

    getUser(id, options) {
        var that = this;

        try {

            Message.welcome(options);

            if(this._prefs.token && this._prefs.user) {
                Message.loggedin(this._prefs.user, options);
                Message.action("Get information for user" , id, options);
                
                let spin = Message.spin(options);
                NodeSDK.start(this._prefs.email, this._prefs.password, this._prefs.host).then(function() {
                    Message.log("execute action...");
                    return that._getUser(that._prefs.token, id);
                }).then(function(json) {

                    Message.unspin(spin);
                    Message.log("action done...", json);

                    if(options.noOutput) {
                        Message.out(json.data);
                    }
                    else {
                        Message.lineFeed();
                        Message.table2D(json.data);
                        Message.lineFeed();
                        Message.success(options);
                    }
                    Message.log("finished!");

                }).catch(function(err) {
                    Message.unspin(spin);
                    Message.error(err, options);
                    Exit.error();
                });
            }
            else {
                Message.notLoggedIn(options);
                Exit.error();
            }
        }
        catch(err) {
            Message.error(err, options);
            Exit.error();
        }
    }
}

module.exports = CUser;