const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const app = express();
const path = require('path');
dotenv.config();

const resourcesRoutes = require('./routes/resources');
const bookingsRoutes = require('./routes/bookings'); 
const authRouter = require('./routes/auth');
const { authenticateToken, authorizeRoles } = require('./middleware/auth');
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: "*" } });
const scheduleRoute = require('./routes/schedule');
app.use('/schedule', scheduleRoute);
app.use(cors());
app.use(express.json()); 
app.use(express.static(path.join(__dirname, '../frontend/public')));
app.use('/resources', resourcesRoutes);
app.use('/bookings', bookingsRoutes); 
app.use('/auth', authRouter);

app.get('/resources', authenticateToken, authorizeRoles('user', 'manager', 'admin'), (req, res) => {
 
  res.json({ message: 'Список ресурсов для ' + req.user.name });
})
io.on('connection', (socket) => {
  console.log('New client connected', socket.id);

  socket.on('subscribeToResource', (resourceId) => {
    socket.join(`resource_${resourceId}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected', socket.id);
  });
});


function notifyBookingCreated(booking) {
  io.to(`resource_${booking.resource_id}`).emit('bookingCreated', booking);
}
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
