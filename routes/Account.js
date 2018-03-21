"use strict";

var CAccount = require('../commands/CAccount');
var Logger = require('../common/Logger');
var Helper = require('../common/Helper');

class Account {

    constructor(program, prefs) {
        this._program = program;
        this._prefs = prefs;
        this._account = new CAccount(this._prefs);
    }

    start() {
        this.listOfCommands()
    }

    stop() {

    }

    listOfCommands() {

        var that = this;

        this._program.command('login', '[email] [password]')
            .description("Log-in to Rainbow")
            .option('--host <hostname>', "Log-in to a specific host. 'hostname' can be 'official' or any hostname. If no --host, 'sandbox' is used")
            .option('--json', 'Write the JSON result to standard stdout')
            .option('-p, --proxy <address>', 'Proxy to use')
            .option('-v, --verbose', 'Use verbose console mode')
            .on('--help', function(){
                console.log('  Examples:');
                console.log('');
                console.log("    $ rbw login 'johndoe@mycompany.com' 'Password_12345'");
                console.log("    $ rbw login 'johndoe@mycompany.com' 'Password_12345' --host official");
                console.log("    $ rbw login 'johndoe@mycompany.com' 'Password_12345' --host openrainbow.com");
                console.log("    $ rbw login 'johndoe@mycompany.com' 'Password_12345' --host openrainbow.com --json");
                console.log("    $ rbw login 'johndoe@mycompany.com' 'Password_12345' --host openrainbow.com --proxy https://192.168.0.10:8080");
                console.log('');
                console.log('  Details:');
                console.log('');
                console.log('    The option `--json` exports the JSON object representing the connected user account to the console');
                console.log('    The option `--host` connects to a specific Rainbow instance. Possible values can be "sandbox" (default) , "official", or any other hostname or IP address');
                console.log('');
            })
            .action(function (email, password, commands) {

                let proxyJSON = null;

                if(commands.proxy) {
                    proxyJSON = Helper.getProxyFromString(commands.proxy);
                }

                var platform = commands.host ? commands.host : "sandbox";

                var options = {
                    noOutput: commands.json || false,
                    proxy: proxyJSON,
                    email: email || null,
                    password: password || null,
                    host: commands.host || null
                };

                Logger.isActive = commands.verbose || false;

                that._account.login(options);
            });

        this._program.command('logout')
            .description("Log-out to Rainbow")
            .option('-v, --verbose', 'Use verbose console mode')
            .on('--help', function(){
                console.log('  Examples:');
                console.log('');
                console.log('    $ rbw logout');
                console.log('');
            })
            .action(function (commands) {

                Logger.isActive = commands.verbose || false;

                that._account.logout();
            });

        this._program.command('set developer')
            .description("Add developer account")
            .option('-v, --verbose', 'Use verbose console mode')
            .on('--help', function(){
                console.log('  Examples:');
                console.log('');
                console.log('    $ rbw set developer');
                console.log('');
            })
            .action(function (commands) {

                Logger.isActive = commands.verbose || false;

                let options = {

                };

                that._account.setDeveloper();
            });

        this._program.command('preferences')
            .description("List the preferences saved on this computer")
            .option('-v, --verbose', 'Use verbose console mode')
            .on('--help', function(){
                console.log('  Examples:');
                console.log('');
                console.log('    $ rbw preferences');
                console.log('');
            })
            .action(function (commands) {

                Logger.isActive = commands.verbose || false;

                let options = {

                };

                that._account.preferences(options);
            });

        this._program.command('remove preferences')
            .description("Remove all preferences saved on this computer")
            .option('-v, --verbose', 'Use verbose console mode')
            .on('--help', function(){
                console.log('  Examples:');
                console.log('');
                console.log('    $ rbw remove preferences');
                console.log('');
            })
            .action(function (commands) {

                Logger.isActive = commands.verbose || false;

                let options = {
                };

                that._account.removePreferences(options);
            });
        
        this._program.command('whoami')
            .description("Display information about the connected user")
            .option('--json', 'Write the JSON result to standard stdout')
            .option('-v, --verbose', 'Use verbose console mode')
            .on('--help', function(){
                console.log('  Examples:');
                console.log('');
                console.log('    $ rbw whoami');
                console.log('    $ rbw whoami --json');
                console.log('');
                console.log('  Details:');
                console.log('');
                console.log('    The option `--json` exports the JSON object representing the user to the console');
                console.log('');
            })
            .action(function (commands) {

                var options = {
                    noOutput: commands.json || false
                }

                Logger.isActive = commands.verbose || false;

                that._account.getConnectedUserInformation(options);
            });

        this._program.command('set keys', '<appid> <appsecret>')
            .description("Set the application id and application secret to your preferences")
            .option('-v, --verbose', 'Use verbose console mode')
            .on('--help', function(){
                console.log('  Examples:');
                console.log('');
                console.log('    $ rbw set keys ece540802b5234e8b514e9067ae48fad TSIDA5LXbk1M10x...ZwxC70flexmPkok6OvE9xeXIa');
                console.log('');
            })
            .action(function (appid, appsecret, commands) {

                Logger.isActive = commands.verbose || false;

                let options = {
                    appid: appid,
                    appsecret: appsecret
                };

                that._account.setKeys(options);
            });

        this._program.command('set password', '<password>')
            .description("Set your password to your preferences")
            .option('-v, --verbose', 'Use verbose console mode')
            .on('--help', function(){
                console.log('  Examples:');
                console.log('');
                console.log('    $ rbw set password 4p8hGf6ie4f_P!');
                console.log('');
            })
            .action(function (password, commands) {

                Logger.isActive = commands.verbose || false;

                let options = {
                    password: password,
                };

                that._account.setPassword(options);
            });

        this._program.command('set email', '<email>')
            .description("Set your login email to your preferences")
            .option('-v, --verbose', 'Use verbose console mode')
            .on('--help', function(){
                console.log('  Examples:');
                console.log('');
                console.log("    $ rbw set email 'johndoe@mycompany.com'");
                console.log('');
            })
            .action(function (email, commands) {

                Logger.isActive = commands.verbose || false;

                let options = {
                    email: email,
                };

                that._account.setEmail(options);
            });

        this._program.command('set host', '<host>')
            .description("Set your host to your preferences")
            .option('-v, --verbose', 'Use verbose console mode')
            .on('--help', function(){
                console.log('  Examples:');
                console.log('');
                console.log('    $ rbw set host sandbox');
                console.log('');
            })
            .action(function (host, commands) {

                Logger.isActive = commands.verbose || false;

                let options = {
                    host: host,
                };

                that._account.setHost(options);
            });

        this._program.command('set proxy', '<proxy>')
            .description("Set your proxy to your preferences")
            .option('-v, --verbose', 'Use verbose console mode')
            .on('--help', function(){
                console.log('  Examples:');
                console.log('');
                console.log('    $ rbw set proxy https://192.168.0.10:8080');
                console.log('');
            })
            .action(function (proxy, commands) {

                Logger.isActive = commands.verbose || false;

                let options = {
                    proxy: Helper.getProxyFromString(proxy),
                };

                that._account.setProxy(options);
            });

        this._program.command('remove proxy')
            .description("Remove the proxy from your preferences")
            .option('-v, --verbose', 'Use verbose console mode')
            .on('--help', function(){
                console.log('  Examples:');
                console.log('');
                console.log('    $ rbw remove proxy');
                console.log('');
            })
            .action(function (commands) {

                Logger.isActive = commands.verbose || false;

                let options = {
                };

                that._account.removeProxy(options);
            });  


        this._program.command('remove keys')
            .description("Remove the application id and application secret from your preferences")
            .option('-v, --verbose', 'Use verbose console mode')
            .on('--help', function(){
                console.log('  Examples:');
                console.log('');
                console.log('    $ rbw remove keys');
                console.log('');
            })
            .action(function (commands) {

                Logger.isActive = commands.verbose || false;

                let options = {
                };

                that._account.removeKeys(options);
            });   
        
        this._program.command('commands')
            .description("List commands depending the user profile")
            .option('-v, --verbose', 'Use verbose console mode')
            .action(function (commands) {
            
                var options = {
                }

                Logger.isActive = commands.verbose || false;

                that._account.getCommands(options);
            });

        this._program.command('configure')
            .description("Configure the account to user and log-in to Rainbow")
            .option('-v, --verbose', 'Use verbose console mode')
            .action(function (commands) {
            
                var options = {
                }

                Logger.isActive = commands.verbose || false;

                that._account.configure(options);
            });
    }
}

module.exports = Account;