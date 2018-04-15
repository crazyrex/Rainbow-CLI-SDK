"use strict";

const NodeSDK   = require('../common/SDK');
const Message   = require('../common/Message');
const Exit      = require('../common/Exit');
const Helper    = require('../common/Helper');
const pkg       = require('../package.json');

class CDeveloper {

    constructor(prefs) {
        this._prefs = prefs;
    }

    _getPayments(token, options, prefs) {

        let that = this;

        return new Promise(function(resolve, reject) {

            var filterToApply = "format=full";

            var id = prefs.user.id;
            if(options.id) {
                id = options.id;
            }

            NodeSDK.get('/api/rainbow/subscription/v1.0/developers/' + id + '/accounts?' + filterToApply, token).then(function(json) {
                resolve(json);
            }).catch(function(err) {
                reject(err);
            });
        });
    }

    _getMethods(token, options, prefs) {

        let that = this;

        return new Promise(function(resolve, reject) {

            var id = prefs.user.id;
            if(options.id) {
                id = options.id;
            }

            NodeSDK.get('/api/rainbow/subscription/v1.0/developers/' + id + '/payments/methods', token).then(function(json) {
                resolve(json);
            }).catch(function(err) {
                reject(err);
            });
        });
    }

    _getSubscriptions(token, options, prefs) {

        let that = this;

        return new Promise(function(resolve, reject) {

            var id = prefs.user.id;
            if(options.id) {
                id = options.id;
            }

            NodeSDK.get('/api/rainbow/subscription/v1.0/developers/' + id + '/subscriptions', token).then(function(json) {
                resolve(json);
            }).catch(function(err) {
                reject(err);
            });
        });
    }

    _deletePayment(token, options, prefs) {

        var id = prefs.user.id;
        if(options.id) {
            id = options.id;
        }

        return new Promise(function(resolve, reject) {
            NodeSDK.put('/api/rainbow/subscription/v1.0/developers/' + id + '/accounts/cancel', token, null).then(function(json) {
                resolve(json);
            }).catch(function(err) {
                reject(err);
            });
        });
    }

    getPayments(options) {
        var that = this;

        Message.welcome(options);

        if(this._prefs.token && this._prefs.user) {
            Message.loggedin(this._prefs, options);

            if(!options.csv) {
                Message.action("List payment for user ", options.id, options);
            }
            
            let spin = Message.spin(options);
            NodeSDK.start(this._prefs.email, this._prefs.password, this._prefs.host, this._prefs.proxy, this._prefs.appid, this._prefs.appsecret).then(function() {
                Message.log("execute action...");
                return that._getPayments(that._prefs.token, options, that._prefs);
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

    getMethods(options) {
        var that = this;

        Message.welcome(options);

        if(this._prefs.token && this._prefs.user) {
            Message.loggedin(this._prefs, options);

            if(!options.csv) {
                Message.action("List payment methods for user ", options.id, options);
            }
            
            let spin = Message.spin(options);
            NodeSDK.start(this._prefs.email, this._prefs.password, this._prefs.host, this._prefs.proxy, this._prefs.appid, this._prefs.appsecret).then(function() {
                Message.log("execute action...");
                return that._getMethods(that._prefs.token, options, that._prefs);
            }).then(function(json) {
                
                Message.unspin(spin);
                Message.log("action done...", json);

                if(options.noOutput) {
                    Message.out(json.data);
                }
                else {
                    Message.lineFeed();
                    Message.tableMethods(json, options);
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

    getSubscriptions(options) {
        var that = this;

        Message.welcome(options);

        if(this._prefs.token && this._prefs.user) {
            Message.loggedin(this._prefs, options);

            if(!options.csv) {
                Message.action("List subscriptions for user ", options.id, options);
            }
            
            let spin = Message.spin(options);
            NodeSDK.start(this._prefs.email, this._prefs.password, this._prefs.host, this._prefs.proxy, this._prefs.appid, this._prefs.appsecret).then(function() {
                Message.log("execute action...");
                return that._getSubscriptions(that._prefs.token, options, that._prefs);
            }).then(function(json) {
                
                Message.unspin(spin);
                Message.log("action done...", json);

                if(options.noOutput) {
                    Message.out(json.data);
                }
                else {
                    Message.lineFeed();
                    Message.tableSubscriptions(json, options);
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

    deletePayment(options) {
        var that = this;

        var doDelete = function(options) {
            Message.action("Delete payment", options.id, options);

            let spin = Message.spin(options);
            NodeSDK.start(that._prefs.email, that._prefs.password, that._prefs.host).then(function() {
                Message.log("execute action...");
                return that._deletePayment(that._prefs.token, options, that._prefs);
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
            Message.loggedin(this._prefs, options);

            if(options.noconfirmation) {
                doDelete(options);
            }
            else {
                Message.confirm('Are-you sure ? It will remote it completely').then(function(confirm) {
                    if(confirm) {
                        doDelete(options);
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
}

module.exports = CDeveloper;