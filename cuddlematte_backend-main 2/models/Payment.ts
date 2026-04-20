import mongoose from 'mongoose';

const PaymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  bookingType: {
    type: String,
    enum: ['apartment', 'massage'],
    required: true
  },
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  provider: {
    type: String,
    enum: ['paystack'],
    default: 'paystack'
  },
  reference: {
    type: String,
    required: true,
    unique: true
  },
  amount: {
    type: Number,
    required: true,
    min: [0, 'Amount must be at least 0']
  },
  currency: {
    type: String,
    default: 'NGN'
  },
  status: {
    type: String,
    enum: ['initialized', 'pending', 'success', 'failed', 'cancelled'],
    default: 'initialized'
  },
  authorizationUrl: {
    type: String,
    default: null
  },
  accessCode: {
    type: String,
    default: null
  },
  paidAt: {
    type: Date,
    default: null
  },
  metadata: {
    type: Object,
    default: {}
  },
  rawResponse: {
    type: Object,
    default: {}
  }
}, {
  timestamps: true
});

export default mongoose.model('Payment', PaymentSchema);
