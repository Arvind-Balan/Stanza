const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose')
const session = require('express-session')
const dotenv = require('dotenv')
dotenv.config({ path: './config.env' })
const userRouter = require('./routes/user');
const adminRouter = require('./routes/admin');
const app = express();
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

//Logger
app.use(logger('dev'));



app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
var hbs = require('express-handlebars');
const Handlebars = require('handlebars');
const expressHandlebars = require('express-handlebars');
const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access');
app.use(express.static(path.join(__dirname, 'public')));
app.engine('hbs', hbs.engine({
  handlebars: allowInsecurePrototypeAccess(Handlebars), defaultLayout: 'layout', layoutsDir: __dirname + '/views/layout/', extname: 'hbs',
  helpers: {
    eq: function (v1, v2) {
      return v1 === v2
    },
    gt: function (v1, v2) {
      return v1 > v2
    },
    dateFormat: function (date) {
      return date.slice(5, 16)
    },
    amountFormat: function (amount) {
      if (amount == null) {
        return 0
      } else {
        return amount.toString().slice(0, 7)
      }
    },
    ifEquals: function (arg1, arg2, arg3, options) {
      return (arg1 == arg2 || arg1 == arg3) ? options.fn(this) : options.inverse(this)
    },
    twoConditions: function (one1, one2, two1, two2, options) {
      return (one1 == one2 || two1 == two2) ? options.fn(this) : options.inverse(this)
    },
    itemsCount: function (items) {
      count = items.length; if (count === 1) {
        return itemsCount = count + ' Item'
      } else {
        return itemsCount = count + ' Items'
      }
    },
    multiplyAmount: function (price, quantity) {
      return total = price * quantity
    },
    //increment num
    increment: function (num) {
      return num + 1
    }
  }

},))
//session
const oneDay = 1000 * 60 * 60 * 24;
app.use(session({
  secret: process.env.SESSION_SECRET,
  saveUninitialized: true,
  cookie: { maxAge: oneDay },
  resave: false
}))
//cache control
app.use((req, res, next) => {
  res.set("cache-control", "no-store");
  next();
})
//connecting mongoose
mongoose.connect(process.env.DATABASE);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback() {
  console.log("database connected");
});
app.use('/', userRouter);
app.use('/admin', adminRouter);
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});
// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
module.exports = app;
