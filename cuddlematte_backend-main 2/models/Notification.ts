import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: [
      'message',
      'connect_request',
      'connect_accepted',
      'connect_declined',
      'ushering_request',
      'ushering_response',
      'ushering_fulfilled'
    ],
    required: true
  },
  data: {
    type: Object,
    default: {}
  },
  read: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

NotificationSchema.index({ user: 1, read: 1, createdAt: -1 });

export default mongoose.model('Notification', NotificationSchema);
