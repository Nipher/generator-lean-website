gulp = require 'gulp'
p = require('gulp-load-plugins')() # loading gulp plugins lazily
bowerFiles = require 'main-bower-files'
<%= if (config.css === 'Style') { %>nib = require 'nib'<%= } %>

node = null

gulp.task 'coffee', ->
  gulp
  .src ['frontend/**/*.coffee','!frontend/bower_components/**/*']
  .pipe p.changed './.tmp', extension:'.js'
  .pipe p.coffee(bare:true).on 'error', (err)->p.util.log err;@emit 'end'
  .pipe gulp.dest './.tmp'


gulp.task 'watch', ['livereload-start'], ->
  gulp.watch ['scripts/**/*.coffee'], ['coffee']
  <%= if (config.css === 'Style') { %>gulp.watch ['styles/**/*.styl'], ['stylus']<%= } %> 
  <%= if (config.markup === 'Jade') { %> <%= gulp.watch ['index.jade'], ['jade'] } %>
  
  toWatch = ['./.tmp/**/*']

  <%= if (config.css === 'CSS') { %>toWatch.push 'styles/**/*'<%= } %>
  <%= if (config.markup === 'HTML') { %>toWatch.push 'index.html'<%= } %>
  
  gulp.watch toWatch
  .on 'change', (file) ->
    p.livereload.changed file.path

<%= if (config.css === 'Style') { %>
gulp.task 'stylus', ->
  gulp
  .src ['styles/**/*.styl']
  .pipe p.changed './.tmp'
  .pipe p.stylus(use:[nib()]).on 'error', (err)->p.util.log "Stylus Error:\n#{err.message}";@emit 'end'
  .pipe gulp.dest './.tmp/styles'
<%= } %> 

indexFile = 'index.html'  
<%= if (config.markup === 'Jade') { %>indexFile = 'index.jade'<%= } %>
gulp.task 'inject-bower', ->
  gulp.src bowerFiles()
  .pipe p.inject indexFile,
    starttag:'//---inject:bower:{{ext}}---'
    endtag:'//---inject---'
    transform: (filepath, file, index, length) ->
      filepath = filepath.replace /^.+?\//, '' #removes frontend/, .tmp/
      ext = filepath.split('.').pop()
      switch ext
      <%= if (config.markup === 'Jade') { %>when 'css'
          "link(rel='stylesheet' href='#{filepath}')"
        when 'js'
          "script(src='#{filepath}')"
      <%= } else if (config.markup = 'HTML') { %>when 'css'
          "<link rel='stylesheet' href='#{filepath}'>"
        when 'js'
          "<script src='#{filepath}'>"
      <%= } %>
  .pipe gulp.dest 'frontend'


<%= if (config.css === 'Style') { %>gulp.task 'inject-scripts', ['coffee', 'stylus', 'inject-bower'], -><%= } else { %>
gulp.task 'inject-scripts', ['coffee', 'inject-bower'], -><%= } %>
  gulp.src ['./.tmp/**/*', '!./.tmp/backend/**/*', '!./.tmp/lib/**'], read:false
  .pipe p.inject indexFile
    starttag:'//---inject:{{ext}}---'
    endtag:'//---inject---'
    transform: (filepath, file, index, length) ->
      filepath = filepath.replace /^.+?\//, '' #removes frontend/, .tmp/
      ext = filepath.split('.').pop()
      switch ext
        <%= if (config.markup === 'Jade') { %>when 'css'
          "link(rel='stylesheet' href='#{filepath}')"
        when 'js'
          "script(src='#{filepath}')"
        <%= } else if (config.markup = 'HTML') { %>when 'css'
            "<link rel='stylesheet' href='#{filepath}'>"
          when 'js'
            "<script src='#{filepath}'>"
        <%= } %>
  .pipe gulp.dest 'frontend'
