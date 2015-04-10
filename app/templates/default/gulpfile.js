'use strict'
<%= if (config.script === 'CoffeeScript') { %>
require('coffee-script/register');
require('./gulpfile.coffee');
<%= } else if (config.script === 'JavaScript') { %>
  
%>