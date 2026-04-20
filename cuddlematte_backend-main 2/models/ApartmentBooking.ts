import mongoose from 'mongoose';

const ApartmentBookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  apartment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Apartment',
    required: true
  },
  checkIn: {
    type: Date,
    required: [true, 'Check-in date is required']
  },
  checkOut: {
    type: Date,
    required: [true, 'Check-out date is required']
  },
  guests: {
    type: Number,
    required: [true, 'Guest count is required'],
    min: [1, 'Guests must be at least 1']
  },
  nights: {
    type: Number,
    required: true,
    min: [1, 'Nights must be at least 1']
  },
  pricePerNight: {
    type: Number,
    required: true,
    min: [0, 'Price per night must be at least 0']
  },
  cleaningFee: {
    type: Number,
    default: 0,
    min: [0, 'Cleaning fee must be at least 0']
  },
  subtotal: {
    type: Number,
    required: true,
    min: [0, 'Subtotal must be at least 0']
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
  specialRequests: {
    type: String,
    default: null,
    maxlength: [1000, 'Special requests cannot exceed 1000 characters']
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

export default mongoose.model('ApartmentBooking', ApartmentBookingSchema);
