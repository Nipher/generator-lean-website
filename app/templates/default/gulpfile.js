'use strict'

var gulp = require( 'gulp' );
var p = require( 'gulp-load-plugins' )(); // loading gulp plugins lazily
var bowerFiles = require( 'main-bower-files' );<% if (config.style === 'Stylus') { %>
var nib = require( 'nib' );<% } %>
var express = require( 'express' );
var app = express();
var connectLivereload = require( 'connect-livereload' );
<% if ( config.markup === 'HTML' ) { %>
var indexFile = './src/index.html';
<% } else if ( config.markup === 'Jade' ) { %>
var indexFile = './src/index.jade';
<% } %>

var bowerInjectOptions = {
  starttag: '<!-- bower:{{ext}} -->',
  endtag: '<!-- endinject -->',
  transform: function ( filepath ) {
    filepath = filepath.replace( /^.+?\//, '' );
    var ext = filepath.split( '.' ).pop();
    switch ( ext ) {
      case 'js':
        return '<script src="' + filepath + '"></script>';
      case 'css':
        return '<link href="' + filepath + '" rel="stylesheet">';
    }
  }
};

var srcInjectOptions = {
  starttag: '<!-- inject:{{ext}} -->',
  endtag: '<!-- endinject -->',
  transform: function ( filepath ) {
    filepath = filepath.replace( /^.+?\//, '' );
    var ext = filepath.split( '.' ).pop();
    switch ( ext ) {
      case 'js':
        return '<script src="' + filepath + '"></script>';
      case 'css':
      return '<link href="' + filepath + '" rel="stylesheet">';
    }
  }
};

<% if ( config.script === 'JavaScript' ) { %>
gulp.task( 'js', function () {
  return gulp
  .src([ './src/scripts/**/*.js' ])
  .pipe( p.changed( './tmp/scripts' ) )
  .pipe( gulp.dest( './.tmp/scripts' ) );
} );<% } else if ( config.script === 'CoffeeScript' ) { %>
gulp.task( 'coffee', function () {
  return gulp
  .src([ './src/scripts/**/*.coffee' ])
  .pipe( p.changed( './.tmp/scripts', { extension: '.js' } ) )
  .pipe( p.coffee({ bare: true }).on( 'error', p.util.log ) )
  .pipe( gulp.dest( './.tmp/scripts' ) );
} );<% } %>

<% if ( config.style === 'CSS' ) { %>
gulp.task( 'css', function () {
  return gulp
  .src([ './src/styles/**/*.css' ])
  .pipe( p.changed( './.tmp/styles' ) )
  .pipe( gulp.dest( './.tmp/styles' ) );
} );<% } else if ( config.style === 'Stylus' ) { %>
gulp.task( 'stylus', function () {
  return gulp
  .src([ './src/styles/**/*.styl' ])
  .pipe( p.changed( './.tmp/styles' ), { extension: '.css' } )
  .pipe( p.stylus({ use: [ nib() ] }).on( 'error', p.util.log ) )
  .pipe( gulp.dest( './.tmp/styles' ) );
} );<% } %>

gulp.task( 'resources', function () {
  return gulp
  .src([ './src/resources/**/*' ])
  .pipe( gulp.dest( './.tmp' ) );
} );

gulp.task( 'build:bower:js', function () {
  return gulp
  .src( bowerFiles() )
  .pipe( p.filter([ '**/*.js', '!*.min.js' ]) )
  .pipe( p.rename( function ( path ) {
    path.extname = '.min.js';
  } ) )
  .pipe( p.uglify() )
  .pipe( gulp.dest( './dist/lib' ) );
} );

gulp.task( 'build:bower:css', function () {
  return gulp
  .src( bowerFiles() )
  .pipe( p.filter([ '**/*.css', '!*.min.css' ]) )
  .pipe( p.rename( function ( path ) { 
    path.extname = '.min.css';
  } ) )
  .pipe( p.minifyCss() )
  .pipe( gulp.dest( './dist/lib' ) );
} );

gulp.task( 'build:bower:index', [ 'build:bower:js', 'build:bower:css' ], function () {
  return gulp
  .src( indexFile )<% if ( config.markup === 'Jade' ) { %>
  .pipe( p.jade({ pretty: true }).on( 'error', p.util.log ) )<% } %>
  .pipe( p.inject( gulp.src([ './dist/lib/*' ]), bowerInjectOptions ) )
  .pipe( gulp.dest( './dist' ) );
} );

gulp.task( 'build:index', [ 'build:bower:index', 'build:js', 'build:css' ], function () {
  return gulp
  .src( './dist/index.html' )
  .pipe( p.inject( gulp.src([ './dist/scripts/*.js', './dist/styles/*.css' ]), srcInjectOptions ) )
  .pipe( gulp.dest( './dist' ) );
} );

gulp.task( 'build:js', function () {
  return gulp
  .src([ './.tmp/scripts/**/*.js' ])
  .pipe( p.uglify() )
  .pipe( gulp.dest( './dist/scripts' ) );
} );

gulp.task( 'build:css', function () {
  return gulp
  .src([ './.tmp/styles/**/*.css' ])
  .pipe( p.minifyCss() )
  .pipe( gulp.dest( './dist/styles' ) );
} );

gulp.task( 'build:resources', function () { 
  return gulp
  .src([ './.tmp/resources/**/*' ])
  .pipe( gulp.dest( './dist/resources' ) );
} );

gulp.task( 'build', [ 'build:index', 'build:resources' ], function () {} );

gulp.task( 'serve:dist', [ 'build' ], function () {
  app.use( connectLivereload() );
  app.use( express.static( './dist' ) );                          
  app.listen( 9001 );
  console.log( 'Express server listening on 0.0.0.0:9001' );
  p.livereload.listen();
} );

gulp.task( 'express', [ 'init:update-index' ], function () {
  var path = './.tmp';
  app.use( connectLivereload() );
  app.use( express.static( path ) );
  app.listen( 9000 );
  console.log( 'Express server listening on 0.0.0.0:9000' );
  p.livereload.listen();
} );

gulp.task( 'watch', [ 'express' ], function () {
  var toWatch = [];
  toWatch.push( './.tmp/scripts/**/*.js' );
  toWatch.push( './.tmp/styles/**/*.css' );
  toWatch.push( './.tmp/index.html' );

  <% if ( config.script === 'JavaScript' ) { %>
  gulp.watch([ './src/scripts/**/*.js' ], [ 'js' ]);
  <% } else if ( config.script === 'CoffeeScript' ) { %>
  gulp.watch([ './src/scripts/**/*.coffee' ], [ 'coffee' ]);<% } %>
  <% if ( config.style === 'CSS' ) { %>
  gulp.watch([ './src/styles/**/*.css' ], [ 'css' ]);
  <% } else if ( config.style === 'Stylus' ) { %>
  gulp.watch([ './src/styles/**/*.styl' ], [ 'stylus' ]);<% } %>
  <% if ( config.markup === 'HTML' ) { %>
  gulp.watch([ './src/index.html' ], [ 'update-index' ]);
  <% } else if ( config.markup === 'Jade' ) { %>
  gulp.watch([ './src/index.jade' ], [ 'update-index' ]);<% } %>
  gulp.watch([ './src/resources/**/*' ], [ 'resources' ]);

  gulp.watch( toWatch )
  .on( 'change', function ( file ) {
    p.livereload.changed( file.path );
  } );
} );

gulp.task( 'inject-bower', function () { 
  return gulp
  .src( indexFile )
  <% if ( config.markup === 'Jade' ) { %>.pipe( p.jade({ pretty: true }).on( 'error', p.util.log ) ) <% } %>
  .pipe( 
    p.inject( 
      gulp.src( bowerFiles(), { read: false } ).pipe( p.filter([ '*.js', '*.css' ]) ), 
      bowerInjectOptions 
    ) 
  )
  .pipe( gulp.dest( './.tmp' ) );
} );

var initDeps = [];<% if ( config.script === 'JavaScript' ) { %>
initDeps.push( 'js' );<% } else if ( config.script === 'CoffeeScript' ) { %>
initDeps.push( 'coffee' );<% } %><% if ( config.style === 'CSS' ) { %>
initDeps.push( 'css' );<% } else if ( config.style === 'Stylus' ) { %>
initDeps.push( 'stylus' );<% } %>
initDeps.push( 'inject-bower' );

gulp.task( 'init:update-index', initDeps, function () { 
  return gulp.src(  './.tmp/index.html' )
  .pipe( p.inject( gulp.src([ './.tmp/scripts/**/*.js', './.tmp/styles/**/*.css' ], { read: false }), srcInjectOptions ) )
  .pipe( gulp.dest( './.tmp' ) );
} );

gulp.task( 'update-index', [ 'inject-bower' ], function () {
  return gulp.src( './.tmp/index.html' )
  .pipe( p.inject( gulp.src( [ './.tmp/scripts/**/*.js', './.tmp/styles/**/*.css' ], { read: false } ), srcInjectOptions ) )
  .pipe( gulp.dest( './.tmp' ) );
} );

gulp.task( 'serve', [ 'watch' ], function () {} );
