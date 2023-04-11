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
const zooInfoRouter = require('./routes/zooInfoRouter');
app.use('/api/zoo-info', zooInfoRouter);

// Start server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});

// Handle database errors
pool.on('error', (err) => {
  console.error(err);
  process.exit(1);
});