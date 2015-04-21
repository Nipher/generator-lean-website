'use strict'

var gulp = require( 'gulp' );
var p = require( 'gulp-load-plugins' )(); // loading gulp plugins lazily
var bowerFiles = require( 'main-bower-files' );<% if (config.style === 'Stylus') { %>
var nib = require( 'nib' );<% } %>
var express = require( 'express' );
var app = express();
var connectLivereload = require( 'connect-livereload' );

<% if (config.script === 'CoffeeScript') { %>gulp.task( 'coffee', function ( done ) {
  gulp
  .src([ './src/scripts/**/*.coffee' ])
  .pipe( p.changed( './.tmp', { extension:'.js' } ) )
  .pipe( p.coffee({ bare: true }).on( 'error', function ( err ) {
    p.util.log( err );
    this.emit( 'end' );
  } ) )
  .pipe( gulp.dest( './.tmp/scripts' ) )
  .on( 'end', done );
} );<% } %>

<% if ( config.markup === 'Jade' ) { %>gulp.task( 'jade', function ( done ) {
  gulp
  .src([ './src/index.jade' ])
  .pipe( p.changed( './.tmp', { extension:'.css' } ) )
  .pipe( p.jade({ pretty: true }).on( 'error', function (err) {
    p.util.log( err );
    this.emit( 'end' );
  } ) )
  .pipe( gulp.dest( './.tmp/' ) )
  .on( 'end', done );
} );<% } %>

<% if (config.style === 'Stylus') { %>gulp.task( 'stylus', function ( done ) {
  gulp
  .src([ './src/styles/**/*.styl' ])
  .pipe( p.changed( './.tmp' ) )
  .pipe( p.stylus({ use: [ nib() ] }).on( 'error', function ( err ) { 
    p.util.log( 'Stylus Error:\n' + err.message );
    this.emit( 'end' );
  } ) )
  .pipe( gulp.dest( './.tmp/styles' ) )
  .on( 'end', done );
} );<% } %>


var deps = [];<% if ( config.markup === 'Jade' ) { %>
deps.push( 'jade' );<% } %><% if ( config.script === 'CoffeeScript' ) { %>
deps.push( 'coffee' );<% } %><% if ( config.style === 'Stylus' ) { %>
deps.push( 'stylus' );<% } %>

gulp.task( 'express', deps, function () {
  gulp.start( 'update-index' );
  var path = <% if ( config.markup === 'HTML' ) { %>'./src';<% } else if ( config.markup === "Jade" ) { %>'./.tmp';<% } %>
  app.use( connectLivereload() );
  app.use( express.static( path ) );
  app.listen( 9000 );
  console.log( 'Express server listening on 0.0.0.0:9000' );
  p.livereload.listen();
});

gulp.task( 'watch', [ 'express' ], function () {
  var toWatch = [];
  <% if ( config.script === 'JavaScript' ) { %>
  toWatch.push( './src/scripts/**/*.js' );<% } else if ( config.script === 'CoffeeScript' ) { %>
  toWatch.push( './.tmp/scripts/**/*.js' );
  gulp.watch([ './src/scripts/**/*.coffee' ], [ 'coffee' ]);<% } %><% if ( config.style === 'CSS' ) { %>
  toWatch.push( './src/styles/**/*.css' );<% } else if ( config.style === 'Stylus' ) { %>
  toWatch.push( './.tmp/styles/**/*.css' );
  gulp.watch([ './src/styles/**/*.styl' ], [ 'stylus' ]);<% } %><% if ( config.markup === 'HTML' ) { %>
  toWatch.push( './src/index.html' );<% } else if ( config.markup === 'Jade' ) { %>
  toWatch.push( './.tmp/index.html' );
  gulp.watch([ './src/index.jade' ], [ 'update-index' ]);<% } %>
  
  gulp.watch( toWatch )
  .on( 'change', function ( file ) {
    p.livereload.changed( file.path );
  } );
});

<% if ( config.markup === 'Jade' ) { %>var indexInfo = { filepath: './.tmp/index.html', folderpath: './.tmp/' };
deps = [ 'jade' ];
<% } else if ( config.markup == 'HTML' ) { %>var indexInfo = { filepath: './src/index.html', folderpath: './src/' };
deps = [];<% } %>

gulp.task( 'inject-bower', deps, function ( done ) {
  var sources = gulp.src( bowerFiles(), { read: false } ).pipe( p.filter([ '*.js', '*.css' ]) );

  var injectOptions = { 
    starttag: '<!-- bower:{{ext}} -->',
    endtag: '<!-- endinject -->',
    transform: function ( filepath ) {
      var ext = filepath.split( '.' ).pop();
      switch ( ext ) {
        case 'js':
          return '<script src="' + <% if ( config.script === 'JavaScript' ) { %>filepath.replace( '/src/', '' )<% } else { %>filepath.replace( '/.tmp/', '' )<% } %> + '"></script>';
        case 'css':
          return '<link href="' + <% if ( config.style === 'CSS' ) { %>filepath.replace( '/src/', '' )<% } else { %>filepath.replace( '/.tmp/', '' )<% } %> + '" rel="stylesheet">';
      }
    }
  };

  gulp.src( indexInfo.filepath )
  .pipe( p.inject( sources, injectOptions ) )
  .pipe( gulp.dest( indexInfo.folderpath ) )
  .on( 'end', done );
} );

gulp.task( 'update-index', [ 'inject-bower' ], function ( done ) {
  var src = [];<% if ( config.script === 'JavaScript' ) { %>
  src.push( './src/scripts/**/*.js' );<% } else if ( config.script === 'CoffeeScript' ) { %>
  src.push( './.tmp/scripts/**/*.js' );<% } %><% if ( config.style === 'CSS' ) { %>
  src.push( './src/styles/**/*.css' );<% } else if ( config.style === 'Stylus' ) { %>
  src.push( './.tmp/styles/**/*.css' ); <% } %>

  var sources = gulp.src( src , { read: false });

  var injectOptions = {
    starttag: '<!-- inject:{{ext}} -->',
    endtag: '<!-- endinject -->',
    transform: function ( filepath ) {
      var ext = filepath.split( '.' ).pop();
      switch ( ext ) {
        case 'js':
          return '<script src="' + <% if ( config.script === 'JavaScript' ) { %>filepath.replace( '/src/', '' )<% } else { %>filepath.replace( '/.tmp/', '' )<% } %> + '"></script>';
        case 'css':
          return '<link href="' + <% if ( config.style === 'CSS' ) { %>filepath.replace( '/src/', '' )<% } else { %>filepath.replace( '/.tmp/', '' )<% } %> + '" rel="stylesheet">';
      }
    }
  };

  gulp.src( indexInfo.filepath )
  .pipe( p.inject( sources, injectOptions ) )
  .pipe( gulp.dest( indexInfo.folderpath ) )
  .on( 'end', done );
});

gulp.task( 'serve', [ 'watch' ], function () {} );