import mongoose from 'mongoose';

const MatchSchema = new mongoose.Schema({
  users: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  matchedAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastMessageAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Validate that a match has exactly 2 users
MatchSchema.path('users').validate(function(value: any[]) {
  return value.length === 2;
}, 'A match must have exactly 2 users');

// Ensure unique matches
MatchSchema.index({ users: 1 }, { unique: true });

// Index for finding matches by user
MatchSchema.index({ users: 1, isActive: 1 });

// Method to check if a user is part of this match
MatchSchema.methods.includesUser = function(userId: string) {
  return this.users.some(user => user.toString() === userId.toString());
};

// Static method to find match between two users
MatchSchema.statics.findBetweenUsers = async function(userId1: string, userId2: string) {
  return this.findOne({
    users: { $all: [userId1, userId2] }
  });
};

export default mongoose.model('Match', MatchSchema);
