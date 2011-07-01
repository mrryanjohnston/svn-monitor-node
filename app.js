/**
 * Module dependencies.
 */

var express = require('express');

var app    = module.exports = express.createServer(),
    events = require('events'),
    eventEmitter = new events.EventEmitter(),
    io     = require('socket.io').listen(app),
    buffer = [];

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// Routes

app.get('/', function(req, res){
  res.render('index', {
    title: 'SVN Monitor',
    commits: buffer
  });
});

app.post('/', function(req, res){
  eventEmitter.emit('commit', req.body);
  buffer.unshift(req.body);
  res.send(req.body);
});

app.listen(3000);

io.sockets.on('connection', function (socket) {
  console.log('connected');
  eventEmitter.on('commit', function(data) {
    socket.emit('newCommit', data);
  });
});
console.log("Express server listening on port %d", app.address().port);
