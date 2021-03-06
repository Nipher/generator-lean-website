'use strict';

var path = require( 'path' );
var assert = require( 'yeoman-generator' ).assert;
var helpers = require( 'yeoman-generator' ).test;
var os = require( 'os' );

describe( 'lean-website websiteName', function () {
  describe( 'with default options', function () {
    before( function ( done ) {
      helpers.run( path.join( __dirname, '../app' ) )
        .withOptions({ skipInstall: true })
        .withPrompts({
          style: 'CSS',
          markup: 'HTML',
          script: 'JavaScript'
         })
        .on( 'end', done );
    } );

    it( 'creates files', function () {
      assert.file([
        '.bowerrc',
        'bower.json',
        'package.json',
        'gulpfile.js',
        'src/index.html',
        'src/resources',
        'src/scripts/main.js',
        'src/styles/main.css'
      ]);
    } );
  } );

  describe( 'with other options', function () {
    before( function ( done ) {
      helpers.run( path.join( __dirname, '../app' ) )
        .withOptions({ skipInstall: true })
        .withPrompts({
          style: 'Stylus',
          markup: 'Jade',
          script: 'CoffeeScript'
         })
        .on( 'end', done );
    } );

    it( 'creates files', function () {
      assert.file([
        '.bowerrc',
        'bower.json',
        'package.json',
        'gulpfile.js',
        'src/index.jade',
        'src/scripts/main.coffee',
        'src/styles/main.styl',
        'src/resources',
        '.tmp/scripts',
        '.tmp/styles',
        '.tmp/resources'
      ]);
    } );
  } );
} );
