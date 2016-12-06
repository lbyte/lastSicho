var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var mongoose = require('mongoose');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();
var lastSicho = new Date('2014-12-12');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

mongoose.connect('mongodb://localhost/test');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
      console.log('connected to mongodb');
});
var excuseSchema = mongoose.Schema({
    name: {type : String, unique : true, dropDups: true },
    times: Number
});
var Excuse = mongoose.model('Excuse', excuseSchema);

app.use('/', routes);
app.use('/users', users);

app.use('/lastsicho', function(req,res,next) {
    res.json({date: lastSicho});
});

app.get('/excuses', function(req,res,next) {
    Excuse.find(function(err, excuses){
        if (err) {
            console.error(err);
        } else {
            console.log(excuses);
            excuses = excuses.map(function(excuse){return excuse.name;});
            res.json(excuses);
        }
    });
});

app.post('/excuses', function(req,res,next) {
    console.log('new excuse is' + JSON.stringify(req.body));
    Excuse.findOneAndUpdate({name: req.body.newExcuse}, {$inc:{times:1}}, function(err, excuse) {
        if (err) {
            console.error(err);
        } else if (excuse === null) {
            var newExcuse = new Excuse({name: req.body.newExcuse, times: 1});
            newExcuse.save(function(err) {
                if (err) {
                    console.error(err);
                }
            });
        }
    });
    lastSicho = new Date();
    res.status(200).end();
});
// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
