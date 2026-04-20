import mongoose from 'mongoose';

const MassageBookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MassageService',
    required: true
  },
  scheduledAt: {
    type: Date,
    required: [true, 'Scheduled time is required']
  },
  locationAddress: {
    type: String,
    required: [true, 'Location address is required'],
    trim: true,
    maxlength: [200, 'Location address cannot exceed 200 characters']
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true,
    maxlength: [100, 'City cannot exceed 100 characters']
  },
  durationMinutes: {
    type: Number,
    required: true,
    min: [15, 'Duration must be at least 15 minutes']
  },
  price: {
    type: Number,
    required: true,
    min: [0, 'Price must be at least 0']
  },
  totalAmount: {
    type: Number,
    required: true,
    min: [0, 'Total amount must be at least 0']
  },
  status: {
    type: String,
    enum: ['pending_payment', 'confirmed', 'cancelled', 'completed'],
    default: 'pending_payment'
  },
  payment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment',
    default: null
  },
  notes: {
    type: String,
    default: null,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  contactName: {
    type: String,
    default: null,
    trim: true,
    maxlength: [120, 'Contact name cannot exceed 120 characters']
  },
  contactPhone: {
    type: String,
    default: null,
    trim: true,
    maxlength: [30, 'Contact phone cannot exceed 30 characters']
  }
}, {
  timestamps: true
});

export default mongoose.model('MassageBooking', MassageBookingSchema);
