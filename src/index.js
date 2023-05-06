const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const pool = require('./utils/mysqlPool');

const app = express();

// Middleware to attach database pool to request object
app.use((req, res, next) => {
  req.pool = pool;
  next();
});

// Middleware
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());
app.use(morgan('combined'));

// Router
const serviceRouter = require('./routes/serviceRouter')
const animalRouter = require('./routes/animalRouter')
const accountRouter = require('./routes/accountRouter')
const listImgRouter = require('./routes/listImgRouter')

app.use('/api/service', serviceRouter);
app.use('/api/animal', animalRouter);
app.use('/api/account', accountRouter);
app.use('/api/images', listImgRouter);

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