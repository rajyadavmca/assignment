var createError = require('http-errors');
const config = require('config');
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
var express = require('express');
var path = require('path');
var logger = require('morgan');
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/assignment',{
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true
}).then(() => console.log('Connected to MongoDB...'))
  .catch(err => console.error('Could not connect to MongoDB...'));

//var indexRouter = require('./routes/index');
var bookingRouter = require('./routes/booking');

var app = express();
mongoose.set("debug", true);
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));



//app.use('/', indexRouter);
app.use('/api/booking', bookingRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
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

module.exports = app;
