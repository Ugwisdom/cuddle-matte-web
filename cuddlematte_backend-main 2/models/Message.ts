import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
  match: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Match',
    required: [true, 'Match reference is required']
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Sender is required']
  },
  content: {
    type: String,
    required: [true, 'Message content is required'],
    trim: true,
    minlength: [1, 'Message cannot be empty'],
    maxlength: [1000, 'Message cannot exceed 1000 characters']
  },
  read: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date,
    default: null
  },
  deleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for finding messages by match
MessageSchema.index({ match: 1, createdAt: -1 });

// Index for finding unread messages
MessageSchema.index({ match: 1, read: 1 });

// Method to mark message as read
MessageSchema.methods.markAsRead = function() {
  if (!this.read) {
    this.read = true;
    this.readAt = new Date();
  }
};

// Static method to get unread count for a match
MessageSchema.statics.getUnreadCount = async function(matchId: string, userId: string) {
  return this.countDocuments({
    match: matchId,
    sender: { $ne: userId },
    read: false,
    deleted: false
  });
};

// Static method to mark all messages as read in a conversation
MessageSchema.statics.markAllAsRead = async function(matchId: string, recipientId: string) {
  return this.updateMany(
    {
      match: matchId,
      sender: { $ne: recipientId },
      read: false
    },
    {
      read: true,
      readAt: new Date()
    }
  );
};

export default mongoose.model('Message', MessageSchema);
