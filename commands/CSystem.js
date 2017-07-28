"use strict";

var CLI         = require('clui');
var Spinner     = CLI.Spinner;
var table       = require('text-table');

const csv = require('csv');
const fs = require('fs');

const pkg = require('../package.json');
const Screen = require("../common/Print");
const NodeSDK = require('../common/SDK');
const Tools = require('../common/Tools');
const Message = require('../common/Message');
const Helper = require('../common/Helper');
const Exit = require('../common/Exit');

class CSystem {

    constructor(prefs) {
        this._prefs = prefs;
    }
    
    _createSystem(token, name, siteId, pbxType, country) {

        return new Promise(function(resolve, reject) {

            var data = {
                name: name,
                siteId: siteId,
                type: pbxType,
                country: country,
                pbxMainBundlePrefix: ["0"]
            };

            NodeSDK.post('/api/rainbow/admin/v1.0/systems', token, data).then(function(json) {
                resolve(json);
            }).catch(function(err) {
                reject(err);
            });
        });
    }
    
    _getSystem(token, id) {

        return new Promise(function(resolve, reject) {

            NodeSDK.get('/api/rainbow/admin/v1.0/systems/' + id, token).then(function(json) {
                resolve(json);
            }).catch(function(err) {
                reject(err);
            });
        });
    }

    _deleteSystem(token, id) {

        var that = this;

        return new Promise(function(resolve, reject) {
            NodeSDK.delete('/api/rainbow/admin/v1.0/systems/' + id, token).then(function(json) {
                resolve(json);
            }).catch(function(err) {
                reject(err);
            });
            resolve();
        });
    }

    _getListOfSystems(token, options) {

        return new Promise(function(resolve, reject) {

            var offset = "";
            if(options.page > 0) {
                offset = "&offset=";
                if(options.page > 1) {
                    offset += (options.limit * (options.page - 1));
                }
                else {
                    offset +=0;
                }
            }

            var limit = "&limit=" + Math.min(options.limit, 1000);

            if(options.siteid) {
                NodeSDK.get('/api/rainbow/admin/v1.0/sites/' + options.siteid + '/systems?format=full' + offset + limit, token).then(function(json) {
                    resolve(json);
                }).catch(function(err) {
                    reject(err);
                });
            }
            else {
                NodeSDK.get('/api/rainbow/admin/v1.0/systems?format=full' + offset + limit, token).then(function(json) {
                    resolve(json);
                }).catch(function(err) {
                    reject(err);
                });
            }
        });
    }

    _linkSystem(token, systemid, siteid) {

        return new Promise(function(resolve, reject) {

            var data = {
                systemId: systemid
            };

            NodeSDK.post('/api/rainbow/admin/v1.0/sites/' + siteid + "/systems", token, data).then(function(json) {
                resolve(json);
            }).catch(function(err) {
                reject(err);
            });
        });
    }

    _unlinkSystem(token, systemid, siteid) {

        return new Promise(function(resolve, reject) {

            NodeSDK.delete('/api/rainbow/admin/v1.0/sites/' + siteid + "/systems/" + systemid, token).then(function(json) {
                resolve(json);
            }).catch(function(err) {
                reject(err);
            });
        });
    }

    deleteSystem(id, options) {
        var that = this;

        var doDelete = function(id) {
            Screen.print("Request to delete system".white + " '".yellow + id.yellow + "'".yellow);
            var status = new Spinner('In progress, please wait...');
            status.start();
            NodeSDK.start(that._prefs.account.email, that._prefs.account.password, that._prefs.rainbow).then(function() {
                return that._deleteSystem(that._prefs.token, id);
            }).then(function(json) {
                status.stop();
                Screen.print('');
                Screen.success('System'.white + " '".yellow + id.yellow + "'".yellow + " has been successfully deleted.".white);
            }).catch(function(err) {
                status.stop();
                Message.error(err);
                Exit.error();
            });
        }

        Message.welcome();
            
        if(this._prefs.token && this._prefs.user) {
            Message.loggedin(this._prefs.user);

            if(options.noconfirmation) {
                doDelete(id);
            }
            else {
                Message.confirm('Are-you sure ? It will remove definitively this system').then(function(confirm) {
                    if(confirm) {
                        doDelete(id);
                    }
                    else {
                        Message.canceled();
                        Exit.error();
                    }
                });
            }
        }
        else {
            Message.notLoggedIn();
            Exit.error();
        }
    }

    getSystems(options) {
        var that = this;

        Message.welcome();
        
        if(this._prefs.token && this._prefs.user) {
            Message.loggedin(this._prefs.user);

            if(!options.csv) {
                Screen.print("Current Systems:".white);
            }
            var status = new Spinner('In progress, please wait...');
            status.start();
            NodeSDK.start(this._prefs.account.email, this._prefs.account.password, this._prefs.rainbow).then(function() {
                return that._getListOfSystems(that._prefs.token, options);
            }).then(function(json) {

                status.stop(); 
                if(options.csv) {
                    let stringify = csv.stringify;
                    var writeStream = fs.createWriteStream(options.csv, { flags : 'w' });

                    stringify(json.data, {
                        formatters: {
                            date: function(value) {
                                return moment(value).format('YYYY-MM-DD');
                            }
                        },
                        delimiter: ";",
                        header: true
                    }).pipe(writeStream);
                    writeStream.on('close', function () {
                        Screen.success("Successfully saved".white + " " + json.total.toString().magenta + " site(s) to".white + " '".white + options.csv.yellow + "'".white);
                    });
                    writeStream.on('error', function (err) {
                        console.log('Error!', err);
                        Exit.error();
                    });
                }
                else {
                    if(json.total > json.limit) {
                        var page = Math.floor(json.offset / json.limit) + 1
                        var totalPage = Math.floor(json.total / json.limit) + 1;
                        
                        Screen.print('Displaying Page '.white + page.toString().yellow + " on ".white + totalPage.toString().yellow);
                    }
                    Screen.print('');

                    var array = [];

                    array.push([ "#".gray, "System name".gray, "Version".gray, "Status".gray, "Type".gray, "ID".gray]);
                    array.push([ "-".gray, "-----------".gray, "-------".gray, "------".gray, "----".gray, "--".gray]);  

                    for (var i = 0; i < json.data.length; i++) {

                        var system = json.data[i];

                        var number = (i+1);
                        if(options.page > 0) {
                            number = ((options.page-1) * json.limit) + (i+1);
                        }

                        var type = system.type || "";
                        var version = system.version || "";
                        var name = system.name || ""
                        var stats = system.status || "";
                        if(stats !== "created") {
                            stats = stats.yellow;
                        }
                        else {
                            stats = stats.white;
                        }

                        array.push([ number.toString().white, name.cyan, version.white, stats, type.white, system.id.white]); 
                    }

                    var t = table(array);
                    Screen.table(t);
                    Screen.print('');
                    Screen.success(json.total + ' systems found.');
                }
            }).catch(function(err) {
                status.stop();
                Message.error(err);
                Exit.error();
            });
        }
        else {
            Message.notLoggedIn();
            Exit.error();
        }
    }

    getSystem(id) {
        var that = this;

        Message.welcome();
            
        if(this._prefs.token && this._prefs.user) {
            Message.loggedin(this._prefs.user);
        
            Screen.print("Request informaton for system".white + " '".yellow + id.yellow + "'".yellow);
            var status = new Spinner('In progress, please wait...');
            status.start();
            NodeSDK.start(this._prefs.account.email, this._prefs.account.password, this._prefs.rainbow).then(function() {
                return that._getSystem(that._prefs.token, id);
            }).then(function(json) {

                status.stop();
                Screen.print('');

                var array = [];
                array.push([ "#".gray, "Attribute".gray, "Value".gray]);
                array.push([ "-".gray, "---------".gray, "-----".gray]);  
                var index = 1;
                for (var key in json.data) {
                    var data = json.data[key];
                    if(data === null) {
                        array.push([ index.toString().white, key.toString().cyan, 'null'.white ]);  
                    } 
                    else if(typeof data === "string" && data.length === 0) {
                        array.push([  index.toString().white, key.toString().cyan, "''".white ]);  
                    }
                    else if(Tools.isArray(data) && data.length === 0) {
                        array.push([  index.toString().white, key.toString().cyan, "[ ]".white ]);  
                    }
                    else if((Tools.isArray(data)) && data.length === 1) {
                        array.push([  index.toString().white, key.toString().cyan, "[ ".white + JSON.stringify(data[0]).white + " ]".white]);  
                    }
                    else if((Tools.isArray(data)) && data.length > 1) {
                        var item = ""
                        for (var i=0; i < data.length; i++) {
                            if(typeof data[i] === "string") {
                                item +=  JSON.stringify(data[i]).white;
                                if(i < data.length -1) {
                                    item += ","
                                }
                            }
                            else {
                                item += "[ " + JSON.stringify(data[i]).white + " ]";
                                if(i < data.length -1) {
                                    item += ","
                                }
                            }
                        }
                        array.push([  index.toString().white, key.toString().cyan, "[ ".white + item.white + " ]" ]);  
                    }
                    else if(Tools.isObject(data)) {
                        array.push([  index.toString().white, key.toString().cyan, JSON.stringify(data).white ]);  
                    }
                    else {
                        array.push([  index.toString().white, key.toString().cyan, data.toString().white ]);
                    }
                    index+=1;
                }

                var t = table(array);
                Screen.table(t);
                Screen.print('');
                Screen.success('System information retrieved successfully.');
            }).catch(function(err) {
                status.stop();
                Message.error(err);
                Exit.error();
            });
        }
        else {
            Message.notLoggedIn();
            Exit.error();
        }
    }

    createSystem(name, siteId, option) {
        var that = this;

        function doCreate(pbxType, country) {
            var status = new Spinner('In progress, please wait...');
            status.start();
            NodeSDK.start(that._prefs.account.email, that._prefs.account.password, that._prefs.rainbow).then(function() {
                return that._createSystem(that._prefs.token, name, siteId, pbxType, country, option);
            }).then(function(json) {
                status.stop();
                Screen.print('');
                Screen.success('System'.white + " '".yellow + name.yellow + "'".yellow + " has been successfully created and associated to ID ".white + json.data.id.cyan);
            }).catch(function(err) {
                status.stop();
                Message.error(err);
                Exit.error();
            });
        }

        Message.welcome();

        if(this._prefs.token && this._prefs.user) {
            Message.loggedin(this._prefs.user);
        
            Screen.print("Request to create system".white + " '".yellow + name.yellow + "'".yellow + ' for site'.white + " '".yellow + siteId.yellow + "'".yellow);

             Message.choices('What kind of PBX you want to create ?', Helper.PABX_list).then(function(pbxType) {
                    
                Message.choices('For which country do you want to create it ?', Helper.country_list).then(function(country) {
                    doCreate(pbxType, country);
                });

            });
            
        }
        else {
            Message.notLoggedIn();
            Exit.error();
        }
    }

    linkSystem(systemid, siteid, option) {
        var that = this;

        Message.welcome();
            
        if(this._prefs.token && this._prefs.user) {
            Message.loggedin(this._prefs.user);
            
        
            Screen.print("Request to link system".white + " '".yellow + systemid.yellow + "'".yellow + " to site".white + " '".yellow + siteid.yellow + "'".yellow);
            var status = new Spinner('In progress, please wait...');
            status.start();
            NodeSDK.start(this._prefs.account.email, this._prefs.account.password, this._prefs.rainbow).then(function() {
                return that._linkSystem(that._prefs.token, systemid, siteid, option);
            }).then(function(json) {
                status.stop();
                Screen.print('');
                Screen.success('System'.white + " '".yellow + systemid.yellow + "'".yellow + " has been successfully linked to site ".white + siteid.cyan);
            }).catch(function(err) {
                status.stop();
                Message.error(err);
                Exit.error();
            });
        }
        else {
            Message.notLoggedIn();
            Exit.error();
        }
    }

    unlinkSystem(systemid, siteid, option) {
        var that = this;

        Message.welcome();
            
        if(this._prefs.token && this._prefs.user) {
            Message.loggedin(this._prefs.user);
            
        
            Screen.print("Request to unlink system".white + " '".yellow + systemid.yellow + "'".yellow + " to site".white + " '".yellow + siteid.yellow + "'".yellow);
            var status = new Spinner('In progress, please wait...');
            status.start();
            NodeSDK.start(this._prefs.account.email, this._prefs.account.password, this._prefs.rainbow).then(function() {
                return that._unlinkSystem(that._prefs.token, systemid, siteid, option);
            }).then(function(json) {
                status.stop();
                Screen.print('');
                Screen.success('System'.white + " '".yellow + systemid.yellow + "'".yellow + " has been successfully unlinked from site ".white + siteid.cyan);
            }).catch(function(err) {
                status.stop();
                Message.error(err);
                Exit.error();
            });
        }
        else {
            Message.notLoggedIn();
            Exit.error();
        }
    }
}

module.exports = CSystem;