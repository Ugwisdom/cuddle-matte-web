import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database';
import errorHandler from './middleware/errorHandler';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import matchRoutes from './routes/matches';
import messageRoutes from './routes/messages';
import adminRoutes from './routes/admin';
import connectRoutes from './routes/connects';
import notificationRoutes from './routes/notifications';
import apartmentRoutes from './routes/apartments';
import massageRoutes from './routes/massages';
import bookingRoutes from './routes/bookings';
import paymentRoutes from './routes/payments';
import usheringRoutes from './routes/ushering';
import adminUsheringRoutes from './routes/adminUshering';
import uploadRoutes from './routes/uploads';

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/connects', connectRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/apartments', apartmentRoutes);
app.use('/api/massages', massageRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/ushering', usheringRoutes);
app.use('/api/admin/ushering', adminUsheringRoutes);
app.use('/api/uploads', uploadRoutes);

// Health check route
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Matchmaking API is running',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler (must be last)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});
