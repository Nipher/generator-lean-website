'use strict';

var util = require( 'util' );
var path = require( 'path' );
var yeoman = require( 'yeoman-generator' );
var yosay = require( 'yosay' );
var chalk = require( 'chalk' );
var mkdirp = require( 'mkdirp' );
var fs = require( 'fs' );

var generator = yeoman.generators.Base.extend({
  promptUser: function () {
    var done = this.async();

    // have Yeoman greet the user
    this.log( yosay() );

    var prompts = [{
      name: 'websiteName',
      message: 'What is your website\'s name?',
      default: this.arguments[0] || this.appname
    },{
      name: 'script',
      message: 'What would you like to write scripts with?',
      type: 'list',
      choices: [ 'CoffeeScript', 'JavaScript' ]
    },{
      name: 'markup',
      message: 'What would you like to write markup with?',
      type: 'list',
      choices: [ 'Jade', 'HTML' ]
    },{
      name: 'style',
      message: 'What would you like to write stylesheets with?',
      type: 'list',
      choices: [ 'Stylus', 'CSS' ],
    },{
      name: 'cssLibrary',
      message: 'Choose CSS library to add',
      type: 'list',
      choices: [ 'Bootstrap', 'None' ]
    },{
      name: 'fontawesome',
      message: 'Would you like to use FontAwesome?',
      type: 'confirm',
      filter: function ( val ) {
        return val;
      }
    }];

    this.prompt( prompts, function ( props ) {
      this.websiteName = props.websiteName;
      this.config.set({
        websiteName: this.websiteName,
        script: props.script,
        markup: props.markup,
        style: props.style,
        cssLibrary: props.cssLibrary,
        fontawesome: props.fontawesome
      });
      done();
    }.bind( this ) );
  },

  saveConfig: function() {
    this.config.save();
  },
  scaffoldFolders: function () {
    this.config = this.config.getAll();
    mkdirp( './src/scripts' );
    mkdirp( './src/styles' );
    mkdirp( './src/resources' );
    mkdirp( './.tmp' );
    mkdirp( './.tmp/resources' );
    mkdirp( './.tmp/styles' );
    mkdirp( './.tmp/scripts' );
  },
  copyMainFiles: function () {
    this.copy( './default/package.json', 'package.json' );
    this.copy( './default/bower.json', 'bower.json' );
    this.copy( './default/.bowerrc', '.bowerrc' );
    if ( this.config.markup === 'HTML' ) {
      this.copy( './default/src/index.html', 'src/index.html' );
    } else if ( this.config.markup === 'Jade' ) {
      this.copy( './default/src/index.jade', 'src/index.jade' );
    }
    if ( this.config.script === 'JavaScript' ) {
      this.copy( './default/src/scripts/main.js', 'src/scripts/main.js' );
    } else if ( this.config.script === 'CoffeeScript' ) {
      this.copy( './default/src/scripts/main.coffee', 'src/scripts/main.coffee' );
    }
    if ( this.config.style === 'CSS' ) {
      this.copy( './default/src/styles/main.css', 'src/styles/main.css' );
    } else if ( this.config.style === 'Stylus' ) {
      this.copy( './default/src/styles/main.styl', 'src/styles/main.styl' );
    }
    this.copy( './default/gulpfile.js', 'gulpfile.js' );
  },
  runNpmAndBower: function () {
    this.installDependencies({
      bower: true,
      npm: true,
      skipInstall: false,
      callback: function () {
        console.log('\nEverything is ready, run gulp serve!');
      }
    });
  }
});

module.exports = generator;
