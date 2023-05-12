const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const pool = require('./utils/mysqlPool');
const path = require('path');
const logger = require('morgan');
const cookieParser = require('cookie-parser');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// Middleware to attach database pool to request object
app.use((req, res, next) => {
  req.pool = pool;
  next();
});

// Middleware
app.use(logger('dev'));
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());
app.use(morgan('combined'));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Router
const serviceRouter = require('./routes/serviceRouter')
const animalRouter = require('./routes/animalRouter')
const accountRouter = require('./routes/accountRouter')
const listImgRouter = require('./routes/listImgRouter')
const ticketRouter = require('./routes/ticketRouter')
const paymentRouter = require('./routes/paymentRouter')

app.use('/api/service', serviceRouter);
app.use('/api/animal', animalRouter);
app.use('/api/account', accountRouter);
app.use('/api/images', listImgRouter);
app.use('/api/ticket', ticketRouter);
app.use('/api/payment', paymentRouter);

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

// Start server
const port = process.env.PORT || 3000;
const host = '0.0.0.0'; // cấu hình để lắng nghe trên tất cả các địa chỉ IP
app.listen(port, host, () => {
  console.log(`Server is listening on ${host}:${port}`);
});

// Handle database errors
pool.on('error', (err) => {
  console.error(err);
  process.exit(1);
});