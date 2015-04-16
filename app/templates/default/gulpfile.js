'use strict'

var gulp = require('gulp');
var p = require('gulp-load-plugins')(); // loading gulp plugins lazily
var bowerFiles = require('main-bower-files');
<% if (config.style === 'Stylus') { %>var nib = require('nib');<% } %>
var express = require('express');
var app = express();
var connectLivereload = require('connect-livereload');


<% if (config.script === 'CoffeeScript') { %>
gulp.task('coffee', function () {
  gulp
  .src(['./src/scripts/**/*.coffee'])
  .pipe(p.changed('./.tmp', { extension:'.js' }))
  .pipe(p.coffee({bare: true }).on('error', function (err) {
    p.util.log(err);
    this.emit('end');
  }))
  .pipe(gulp.dest('./.tmp'));
});<% } %>
<% if (config.markup === 'Jade') { %>gulp.task('jade', function () {
  gulp
  .src(['./src/index.jade'])
  .pipe(p.changed('./.tmp', { extension:'.css' }))
  .pipe(p.jade({ pretty: true }).on('error', function (err) {
    p.util.log(err);
    this.emit('end');
  }))
  .pipe(gulp.dest('./.tmp'));
});<% } %>

gulp.task('livereload-start', function () {
  var path = <% if (config.markup === 'HTML') { %>'./src';<% } else if (config.markup === "Jade") { %>'./.tmp';<% } %>
  app.use(connectLivereload());
  app.use(express.static(path));
  app.listen(9000);
  console.log('Express server listening on 0.0.0.0:9000');
  p.livereload.listen();
});

gulp.task('watch', ['livereload-start'], function () {
  var toWatch = []
  
  <% if (config.script === 'JavaScript') { %>toWatch.push('./src/scripts/**/*.js'); 
  <% } else if (config.script === 'CoffeeScript') { %>toWatch.push('./.tmp/scripts/**/*.js'); 
  gulp.watch(['./src/scripts/**/*.coffee'], ['coffee']);<% } %>

  <% if (config.style === 'CSS') { %>toWatch.push('./src/styles/**/*.css');
  <% } else if (config.style === 'Stylus') { %>toWatch.push('./.tmp/styles/**/*.css');
  gulp.watch(['./src/styles/**/*.styl'], ['stylus']);<% } %>
  
  <% if (config.markup === 'HTML') { %>toWatch.push('./src/index.html');
  <% } else if (config.markup === 'Jade') { %>toWatch.push('./.tmp/index.html');
  gulp.watch(['./src/index.jade'], ['jade']);<% } %>

  gulp.watch(toWatch)
  .on('change', function (file) {
    p.livereload.changed(file.path);
  });
});
<% if (config.style === 'Stylus') { %>
gulp.task('stylus', function () {
  gulp
  .src(['./src/styles/**/*.styl'])
  .pipe(p.changed('./.tmp'))
  .pipe(p.stylus({ use:[nib()] }).on('error', function (err) { 
    p.util.log("Stylus Error:\n#{err.message}");
    this.emit('end');
  }))
  .pipe(gulp.dest('./.tmp/styles'));
});<% } %>

var indexFile = <% if (config.markup === 'Jade') { %>'./src/index.jade'<% } else if (config.markup == 'HTML') { %>'./src/index.html'<% } %>

gulp.task('inject-bower', function () {
  gulp.src(bowerFiles())
  .pipe(p.inject(indexFile, {
    <% if (config.markup === "HTML") { %>starttag: '<!--inject:bower:{{ext}}-->',
    endtag: '<!--inject-->',<% } else if (config.markup === "Jade") { %>starttag: '//---inject:bower:{{ext}}---',
    endtag: '//---inject---',<% } %>
    transform: function (filepath, file, index, length) {
      if (!filepath) return;
      filepath = filepath.replace(/^.+?\//, '');
      var ext = filepath.split('.').pop();
      switch (ext) {
        <% if (config.markup === 'Jade') { %>case 'css':
          return "link(rel='stylesheet' href='"+filepath+"')";
        case 'js':
          return "script(src='"+filepath+"')";
        <% } else if (config.markup = 'HTML') { %>case 'css':
          return "<link rel='stylesheet' href='"+filepath+"'>";
        case 'js':
          return "<script src='"+filepath+"'></script>";<% } %> 
      }
    }
  }))
  .pipe(gulp.dest('./src'));
});

var deps = ['inject-bower'];
<% if (config.markup === 'Jade') { %>deps.push('jade');<% } %>
<% if (config.style === 'Stylus') { %>deps.push('stylus');<% } %>
<% if (config.script === 'CoffeeScript') { %>deps.push('coffee');<% } %>
gulp.task('inject-scripts', deps, function () {
  var src = [];
  
  <% if (config.script === 'JavaScript') { %>src.push('./src/scripts/**/*.js');
  <% } else if (config.script === 'CoffeeScript') { %>src.push('./.tmp/scripts/**/*.coffee');<% } %>
  
  <% if (config.style === 'CSS') { %>src.push('./src/styles/**/*.css');
  <% } else if (config.style === 'Stylus') { %> src.push('./.tmp/styles/**/*.stylus'); <% } %>

  gulp.src(src, { read: false })
  .pipe(p.inject(indexFile, {
    <% if (config.markup === "HTML") { %>starttag: '<!--inject:{{ext}}-->',
    endtag: '<!--inject-->',<% } else if (config.markup === "Jade") { %>starttag: '//---inject:{{ext}}---',
    endtag: '//---inject---',<% } %>
    transform: function (filepath, file, index, length) {
      if (!filepath) return;
      filepath = filepath.replace(/^.+?\//, '')
      var ext = filepath.split('.').pop();
      switch (ext) {
        <% if (config.markup === 'Jade') { %>
        case 'css':
          return "link(rel='stylesheet' href='"+filepath+"')";
        case 'js':
          return "script(src='"+filepath+"')";
        <% } else if (config.markup = 'HTML') { %>
        case 'css':
          return "<link rel='stylesheet' href='"+filepath+"'>";
        case 'js':
          return "<script src='"+filepath+"'></script>";<% } %>
      }
    }
  }))
  .pipe(gulp.dest('./src'));
});

var deps = [];

gulp.task('serve', ['inject-scripts', 'watch'], function () {});
