/**
 * SocialNet — Express + Socket.io entry point
 */
require('dotenv').config();

const express      = require('express');
const http         = require('http');
const { Server }   = require('socket.io');
const path         = require('path');
const helmet       = require('helmet');
const cors         = require('cors');
const morgan       = require('morgan');
const rateLimit    = require('express-rate-limit');
const errorHandler = require('./middleware/errorHandler');

const app    = express();
const server = http.createServer(app);
const io     = new Server(server, { cors: { origin: '*' } });

// ──────────────────────────────────────────
// Security & middleware
// ──────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: false  // easier for dev with CDN links
}));
app.use(cors());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limit: 200 requests / 15 min per IP
app.use('/api', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' }
}));

// ──────────────────────────────────────────
// Static files
// ──────────────────────────────────────────
app.use(express.static(path.join(__dirname, '../client')));

// ──────────────────────────────────────────
// API routes
// ──────────────────────────────────────────
app.use('/api', require('./routes/index'));

// ──────────────────────────────────────────
// SPA fallback — serve index.html for all other GET requests
// ──────────────────────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/index.html'));
});

// ──────────────────────────────────────────
// Global error handler
// ──────────────────────────────────────────
app.use(errorHandler);

// ──────────────────────────────────────────
// Socket.io — real-time notifications
// ──────────────────────────────────────────
const onlineUsers = new Map(); // userId → socketId

io.on('connection', socket => {
  socket.on('user:online', userId => {
    onlineUsers.set(String(userId), socket.id);
    io.emit('users:online', Array.from(onlineUsers.keys()));
  });

  socket.on('disconnect', () => {
    for (const [uid, sid] of onlineUsers) {
      if (sid === socket.id) { onlineUsers.delete(uid); break; }
    }
    io.emit('users:online', Array.from(onlineUsers.keys()));
  });
});

// Expose io globally so controllers can emit
app.set('io', io);
app.set('onlineUsers', onlineUsers);

// ──────────────────────────────────────────
// Start
// ──────────────────────────────────────────
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`\n🚀  SocialNet running at http://localhost:${PORT}`);
  console.log(`📡  Socket.io ready`);
  console.log(`🌍  Mode: ${process.env.NODE_ENV || 'development'}\n`);
});
