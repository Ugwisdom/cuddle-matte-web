import mongoose from 'mongoose';

const UsheringRequestSchema = new mongoose.Schema({
  requester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  girlsRequested: {
    type: Number,
    required: [true, 'Girls requested is required'],
    min: [1, 'Girls requested must be at least 1']
  },
  location: {
    type: String,
    required: [true, 'Event location is required'],
    trim: true,
    maxlength: [200, 'Location cannot exceed 200 characters']
  },
  eventType: {
    type: String,
    required: [true, 'Event type is required'],
    trim: true,
    maxlength: [120, 'Event type cannot exceed 120 characters']
  },
  eventDate: {
    type: Date,
    required: [true, 'Event date is required']
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'declined', 'fulfilled'],
    default: 'pending'
  },
  girlsProvided: {
    type: Number,
    min: [0, 'Girls provided cannot be negative'],
    default: null
  },
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  adminNote: {
    type: String,
    default: null,
    maxlength: [1000, 'Admin note cannot exceed 1000 characters']
  },
  respondedAt: {
    type: Date,
    default: null
  },
  fulfilledAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

UsheringRequestSchema.index({ requester: 1, createdAt: -1 });
UsheringRequestSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model('UsheringRequest', UsheringRequestSchema);
