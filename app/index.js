'use strict';

var util = require('util');
var path = require('path');
var yeoman = require('yeoman-generator');
var yosay = require('yosay');
var chalk = require('chalk');
var mkdirp = require('mkdirp');
var fs = require('fs');
// var dependencies = require('/templates/default/')

var generator = yeoman.generators.Base.extend({
  promptUser: function() {
    var done = this.async();

    // have Yeoman greet the user
    this.log(yosay());

    var prompts = [{
      name: 'websiteName',
      message: 'What is your website\'s name?',
      default: this.arguments[0] || this.appname
    },{
      name: 'script',
      message: 'What would you like to write scripts with?',
      type: 'list',
      choices: ['JavaScript', 'CoffeeScript']
    },{
      name: 'markup',
      message: 'What would you like to write markup with?',
      type: 'list',
      choices: ['HTML', 'Jade']
    },{
      name: 'css',
      message: 'What would you like to write stylesheets with?',
      type: 'list',
      choices: ['CSS', 'Stylus']
    },{
      name: 'cssLibrary',
      message: 'Choose CSS library to add',
      type: 'list',
      choices: ['Bootstrap', 'None']
    },{
      name: 'fontawesome',
      message: 'Would you like to use FontAwesome?',
      type: 'confirm',
      filter: function(val) {
        return val;
      }
    }];

    this.prompt(prompts, function(props) {
      this.websiteName = props.websiteName;
      this.config.set({
        websiteName: this.websiteName,
        script: props.script,
        markup: props.markup,
        css: props.css,
        cssLibrary: props.cssLibrary,
        fontawesome: props.fontawesome
      });
      done();
    }.bind(this));
  },

  saveConfig: function() {
    this.config.save();
  },
  scaffoldFolders: function () {
    mkdirp("./scripts");
    mkdirp("./scripts/modules");
    mkdirp("./styles");
    mkdirp("./resources");
  },
  copyMainFiles: function() {
    this.config = this.config.getAll();
    this.copy('./default/package.json', './package.json');
    if (this.config.markup === 'HTML') {
      this.copy('./default/index.html', './index.html');
    } else if (this.config.markup === 'Jade') {
      this.copy('./default/index.jade', './index.jade');
    }
    this.copy('./default/gulpfile.js', './gulpfile.js');
  },
  runNpm: function() {
    if (this.options['skip-install'])
      return;
    var done = this.async();
    console.log("\nRunning NPM Install. Bower is next.\n");

    this.npmInstall('', null, function() {
      done();
    });
  },
  runBower: function() {
    if (this.options['skip-install'])
      return; 
    var done = this.async();
    console.log("\nRunning Bower:\n");
    this.bowerInstall("", function(){
      console.log("\nAll set! Type: gulp serve\n");
      done();
    });
  }
});

module.exports = generator;
