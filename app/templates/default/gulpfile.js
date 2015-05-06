'use strict'

var gulp = require( 'gulp' );
var p = require( 'gulp-load-plugins' )(); // loading gulp plugins lazily
var bowerFiles = require( 'main-bower-files' );<% if (config.style === 'Stylus') { %>
var nib = require( 'nib' );<% } %>
var express = require( 'express' );
var app = express();
var connectLivereload = require( 'connect-livereload' );
<% if ( config.script === 'JavaScript' ) { %>
gulp.task( 'js', function () {
  return gulp
  .src([ './src/scripts/**/*.js' ])
  .pipe( gulp.dest( './.tmp/scripts' ) );
} );<% } else if ( config.script === 'CoffeeScript' ) { %>
gulp.task( 'coffee', function () {
  return gulp
  .src([ './src/scripts/**/*.coffee' ])
  .pipe( p.changed( './.tmp', { extension: '.js' } ) )
  .pipe( p.coffee({ bare: true }).on( 'error', p.util.log ) )
  .pipe( gulp.dest( './.tmp/scripts' ) );
} );<% } %><% if ( config.markup === 'HTML' ) { %>
gulp.task( 'html', function () {
  return gulp
  .src([ './src/index.html' ])
  .pipe( gulp.dest( './.tmp' ) );
} );<% } else if ( config.markup === 'Jade' ) { %>
gulp.task( 'jade', function () {
  return gulp
  .src([ './src/index.jade' ])
  .pipe( p.changed( './.tmp', { extension:'.css' } ) )
  .pipe( p.jade({ pretty: true }).on( 'error', p.util.log ) )
  .pipe( gulp.dest( './.tmp' ) );
} );<% } %>
<% if ( config.style === 'CSS' ) { %>
gulp.task( 'css', function () {
  return gulp
  .src([ './src/styles/**/*.css' ])
  .pipe( gulp.dest( './.tmp/styles' ));
} );<% } else if ( config.style === 'Stylus' ) { %>
gulp.task( 'stylus', function () {
  return gulp
  .src([ './src/styles/**/*.styl' ])
  .pipe( p.changed( './.tmp' ) )
  .pipe( p.stylus({ use: [ nib() ] }).on( 'error', p.util.log ) )
  .pipe( gulp.dest( './.tmp/styles' ) );
} );<% } %>

gulp.task( 'resources', function () {
  return gulp
  .src([ './src/resources/**/*' ])
  .pipe( gulp.dest( './.tmp' ) );
} );

gulp.task( 'bower', function () {
  return gulp
  .src( bowerFiles(), { read: false } )
  .pipe( p.filter([ '*.min.js', '*.min.css' ]) )
  .pipe( gulp.dest( './dist' ) );
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
  <% if ( config.script === 'JavaScript' ) { %>
  gulp.watch([ './src/scripts/**/*.js' ], [ 'js' ]);
  toWatch.push( './.tmp/scripts/**/*.js' );<% } else if ( config.script === 'CoffeeScript' ) { %>
  toWatch.push( './.tmp/scripts/**/*.js' );
  gulp.watch([ './src/scripts/**/*.coffee' ], [ 'coffee' ]);<% } %><% if ( config.style === 'CSS' ) { %>
  gulp.watch([ './src/styles/**/*.css' ], [ 'css' ]);
  toWatch.push( './.tmp/styles/**/*.css' );<% } else if ( config.style === 'Stylus' ) { %>
  toWatch.push( './.tmp/styles/**/*.css' );
  gulp.watch([ './src/styles/**/*.styl' ], [ 'stylus' ]);<% } %><% if ( config.markup === 'HTML' ) { %>
  gulp.watch([ './src/index.html' ], [ 'update-index' ]);
  toWatch.push( './.tmp/index.html' );<% } else if ( config.markup === 'Jade' ) { %>
  toWatch.push( './.tmp/index.html' );
  gulp.watch([ './src/index.jade' ], [ 'update-index' ]);<% } %>
  gulp.watch([ './src/resources/**/*' ], [ 'resources' ]);

  gulp.watch( toWatch )
  .on( 'change', function ( file ) {
    p.livereload.changed( file.path );
  } );
} );

var deps = [];
<% if ( config.markup === 'HTML' ) { %>deps.push( 'html' );
<% } else if ( config.markup === 'Jade' ) { %>deps.push( 'jade' );<% } %>
var indexInfo = { filepath: './.tmp/index.html', folderpath: './.tmp/' };

gulp.task( 'inject-bower', deps, function () {
  var sources = gulp.src( bowerFiles(), { read: false } )
  .pipe( p.filter([ '*.js', '*.css' ]) );

  var injectOptions = {
    starttag: '<!-- bower:{{ext}} -->',
    endtag: '<!-- endinject -->',
    transform: function ( filepath ) {
      var ext = filepath.split( '.' ).pop();
      switch ( ext ) {
        case 'js':
          return '<script src="' + filepath.replace( '/.tmp/', '' ) + '"></script>';
        case 'css':
          return '<link href="' + filepath.replace( '/.tmp/', '' ) + '" rel="stylesheet">';
      }
    }
  };

  return gulp.src( indexInfo.filepath )
  .pipe( p.inject( sources, injectOptions ) )
  .pipe( gulp.dest( indexInfo.folderpath ) );
} );

var updateIndex = function () {
  var sources = gulp.src( [ './.tmp/scripts/**/*.js', './.tmp/styles/**/*.css' ], { read: false });

  var injectOptions = {
    starttag: '<!-- inject:{{ext}} -->',
    endtag: '<!-- endinject -->',
    transform: function ( filepath ) {
      var ext = filepath.split( '.' ).pop();
      switch ( ext ) {
        case 'js':
          return '<script src="' + filepath.replace( '/.tmp/', '' ) + '"></script>';
        case 'css':
          return '<link href="' + filepath.replace( '/.tmp/', '' ) + '" rel="stylesheet">';
      }
    }
  };

  return gulp.src( indexInfo.filepath )
  .pipe( p.inject( sources, injectOptions ) )
  .pipe( gulp.dest( indexInfo.folderpath ) );
};

var initDeps = [];<% if ( config.script === 'JavaScript' ) { %>
initDeps.push( 'js' );<% } else if ( config.script === 'CoffeeScript' ) { %>
initDeps.push( 'coffee' );<% } %><% if ( config.style === 'CSS' ) { %>
initDeps.push( 'css' );<% } else if ( config.style === 'Stylus' ) { %>
initDeps.push( 'stylus' );<% } %>
initDeps.push( 'inject-bower' );

gulp.task( 'init:update-index', initDeps, updateIndex );
gulp.task( 'update-index', [ 'inject-bower' ], updateIndex );

gulp.task( 'serve', [ 'watch' ], function () {} );
