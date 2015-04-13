'use strict'

var gulp = require('gulp');
var p = require('gulp-load-plugins')(); // loading gulp plugins lazily
var bowerFiles = require('main-bower-files');

node = null
<% if (config.script === 'CoffeeScript') { %>
gulp.task('coffee', function () {
  gulp()
  .src(['scripts/**/*.coffee'])
  .pipe(p.changed('./.tmp', { extension:'.js' }))
  .pipe(p.coffee({bare: true }).on('error', function (err) {
    p.util.log(err);
    this.emit('end');
  }))
  .pipe(gulp.dest('./.tmp'));
});<% } %>
<% if (config.css === 'Jade') { %>gulp.task('jade', function () {
  gulp()
  .src(['index.jade'])
  .pipe(p.changed('./.tmp', { extension:'.css' }))
  .pipe(p.jade({ pretty: true }).on('error', function (err) {
    p.util.log(err);
    this.emit('end');
  }))
  .pipe(gulp.dest('./.tmp'));
});<% } %>

gulp.task('watch', ['livereload-start'], function () {
  <% if (config.script === 'CoffeeScript') { %>
  gulp.watch(['scripts/**/*.coffee'], ['coffee']);<% }
  if (config.css === 'Stylus') { %>gulp.watch(['styles/**/*.styl'], ['stylus']);<% } 
  if (config.markup === 'Jade') { %>gulp.watch(['index.jade'], ['jade']);<% } %>
  var toWatch = ['./.tmp/**/*']

  <% if (config.css === 'CSS') { %>toWatch.push('styles/**/*.css');<% } else if (config.css === 'Stylus') { %>toWatch.push('.tmp/styles/**/*.css');<% } %>
  <% if (config.markup === 'HTML') { %>toWatch.push('index.html');<% } else if (config.markup === 'Jade') { %>toWatch.push('.tmp/index.jade');<% } %>
  
  gulp.watch(toWatch)
  .on('change', function (file) {
    p.livereload.changed(file.path);
  });
});
<% if (config.css === 'Stylus') { %>
gulp.task('stylus', function () {
  gulp()
  .src(['styles/**/*.styl'])
  .pipe(p.changed('./.tmp'))
  .pipe(p.stylus({ use:[nib()] }).on('error', function (err) { 
    p.util.log("Stylus Error:\n#{err.message}");
    this.emit('end');
  }))
  .pipe(gulp.dest('./.tmp/styles'));
});<% } %>

var indexFile = <% if (config.markup === 'Jade') { %>'index.jade'<% } else if (config.markup == 'HTML') { %>'index.html'<% } %>

gulp.task('inject-bower', function () {
  gulp.src(bowerFiles())
  .pipe(p.inject(indexFile, {
    starttag:'//---inject:bower:{{ext}}---',
    endtag:'//---inject---',
    transform: function (filepath, file, index, length) {
      filepath = filepath.replace(/^.+?\//, '');
      var ext = filepath.split('.').pop();
      switch (ext) {
        <% if (config.markup === 'Jade') { %>case 'css':
          return "link(rel='stylesheet' href='#{filepath}')";
        case 'js':
          return "script(src='#{filepath}')";
        <% } else if (config.markup = 'HTML') { %>case 'css':
          return "<link rel='stylesheet' href='#{filepath}'>";
        case 'js':
          return "<script src='#{filepath}'>";<% } %> 
      }
    }
  }))
  .pipe(gulp.dest('./'));
});

var deps = ['inject-bower'];
<% if (config.css === 'Stylus') { %>deps.push('stylus');<% } %>
<% if (config.script === 'CoffeeScript') { %>deps.push('coffee');<% } %>
gulp.task('inject-scripts', deps, function () {
  var src = [];
  <% if (config.script === 'JavaScript') { %>src.push('./scripts/**/*.js');<% } 
  else if (config.script === 'CoffeeScript') { %>src.push('./.tmp/scripts/**/*.coffee');<% } %>
  <% if (config.css === 'CSS') { %>src.push('./styles/**/*.css');<% }
  else if (config.css === 'Stylus') { %> src.push('./.tmp/styles/**/*.stylus'); <% } %>
  gulp.src(src, { read: false })
  .pipe(p.inject(indexFile, {
    starttag: '//---inject:{{ext}}---',
    endtag: '//---inject---',
    transform: function (filepath, file, index, length) {
      filepath = filepath.replace(/^.+?\//, '')
      ext = filepath.split('.').pop()
      switch (ext) {
        <% if (config.markup === 'Jade') { %>case 'css':
          return "link(rel='stylesheet' href='#{filepath}')";
        case 'js':
          return "script(src='#{filepath}')";
        <% } else if (config.markup = 'HTML') { %>case 'css':
          return "<link rel='stylesheet' href='#{filepath}'>";
        case 'js':
          return "<script src='#{filepath}'>";<% } %>
      }
    }
  }))
  .pipe(gulp.dest('./'));
});

gulp.task('serve', ['inject-scripts', 'watch'], function () {});
