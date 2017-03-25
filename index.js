#!/usr/bin/env node
var Preferences = require('preferences');
var program     = require('commander-plus');
var colors      = require('colors');

var pkg = require('./package.json')
var Account = require('./routes/Account');
var Company = require('./routes/Company');
var Organization = require('./routes/Organization');
var Status = require('./routes/Status');
var User = require('./routes/User');
var Free = require('./routes/Free');
var Screen = require('./common/Print');

var prefs = null;

start = function() {
  
  // Get the prefs
  prefs = new Preferences('rainbow');

  // Initialize the program
  program.version(pkg.version);

  // Initialize the routes
  var account = new Account(program, prefs);
  var company = new Company(program, prefs);
  var organization = new Organization(program, prefs);
  var status = new Status(program, prefs);
  var user = new User(program, prefs);
  var free = new Free(program, prefs);

  // Start the routes
  account.start();
  company.start();
  organization.start();
  status.start();
  user.start();
  free.start();

  program
  .command('*')
  .action(function () {
    Screen.print('Command not found.')
  })

  program.parse(process.argv);
}

start();