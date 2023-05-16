const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const pool = require('./utils/mysqlPool');
const path = require('path');
const logger = require('morgan');
const cookieParser = require('cookie-parser');

const app = express();

//chat
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const { v4: uuidv4 } = require('uuid');

// Lưu trữ thông tin phiên chat và tin nhắn
const chatSessions = {};

function generateChatId() {
    return uuidv4();
}

// API endpoint để bắt đầu phiên chat
app.post('/chat', (req, res) => {
    // Tạo mã phiên chat
    const chatId = generateChatId();

    // Lưu trữ thông tin phiên chat và mảng tin nhắn trong chatSessions
    chatSessions[chatId] = { messages: [] };

    // Trả về mã phiên chat cho ứng dụng React Native
    res.json({ chatId });
});

// Xử lý kết nối socket.io
io.on('connection', (socket) => {
    console.log('A user connected');

    // Xử lý khi một người dùng tham gia phiên chat
    socket.on('join-chat', (chatId) => {
        console.log('User joined chat:', chatId);

        // Lưu trữ thông tin phiên chat trong socket
        socket.chatId = chatId;

        // Tham gia vào room tương ứng với phiên chat
        socket.join(chatId);

        // Lấy các tin nhắn trước đó trong phiên chat và gửi lại cho người dùng
        const chat = chatSessions[chatId];
        const previousMessages = chat ? chat.messages : [];
        socket.emit('previous-messages', previousMessages);
    });

    // Xử lý khi một tin nhắn được gửi
    socket.on('send-message', (message) => {
        console.log('Message received:', message);

        // Lấy thông tin phiên chat từ socket
        const chatId = socket.chatId;

        // Lưu trữ tin nhắn vào chatSessions
        if (chatSessions[chatId]) {
            chatSessions[chatId].messages.push(message);
        }

        // Gửi tin nhắn đến người nhận
        socket.to(chatId).emit('new-message', message);
    });

    // Xử lý khi một người dùng rời khỏi phiên chat
    socket.on('disconnect', () => {
        console.log('A user disconnected');

        // Xóa thông tin phiên chat liên quan đến socket
        delete socket.chatId;
    });
});

/////////////////

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
const animalRouter = require('./routes/animalRouter')
const accountRouter = require('./routes/accountRouter')
const listImgRouter = require('./routes/listImgRouter')
const ticketRouter = require('./routes/ticketRouter')
const paymentRouter = require('./routes/paymentRouter')

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
http.listen(port, host, () => {
  console.log(`Server is listening on ${host}:${port}`);
});

// Handle database errors
pool.on('error', (err) => {
  console.error(err);
  process.exit(1);
});