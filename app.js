var mongoose = require('mongoose');

// Use native node promises
mongoose.Promise = global.Promise;

mongoose.connect('mongodb://localhost/bitmark-api')
  .then(() => console.log('connection succesful'))
  .catch((err) => console.error(err));

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var Replies = require('./models/Replies.js');
var Users = require('./models/Users.js');
var index = require('./routes/index');
var users = require('./routes/users');
var api   = require('./routes/api'); 
var multer = require('multer');
//var upload = multer ({ dest: "./uploads", rename: function(fieldname,filename) { return "test" } });
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/')
  },
  filename: function (req, file, cb) {
    Users.findOne({"login-cookie": req.headers.cookie.split("login-cookie=")[1].split(';')[0] }, function (err, post) {
      if (err) return next(err);
      if (post) {
        cb(null, post.username);
      } else { console.log("WTF ERROR!"); }
    });      
  }
});
var upload = multer({ storage: storage });

var app = express();

app.post('/uploads', upload.single('upl'), function(req,res){
  console.log(req.file); //form files
  res.render('bitmark', { title: "Upload sucess" });     
  res.status(204).end();
});


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);
app.use('/api', api);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

var https = require('https');
var fs = require('fs');
var http = require('http');
var options = {
  key: fs.readFileSync('/etc/letsencrypt/live/leathan.xyz/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/leathan.xyz/fullchain.pem'),
  ca: fs.readFileSync('/etc/letsencrypt/live/leathan.xyz/chain.pem')
};

https.createServer(options, app).listen(443, function(){console.log("listening on port 443.")});
http.createServer(function (req, res) {
  res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
  res.end();
}).listen(80, function(){console.log("listening on port 80.")});


module.exports = app;
