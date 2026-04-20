import mongoose from 'mongoose';

const ApartmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [120, 'Title cannot exceed 120 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true,
    maxlength: [200, 'Address cannot exceed 200 characters']
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true,
    maxlength: [100, 'City cannot exceed 100 characters']
  },
  state: {
    type: String,
    default: null,
    trim: true,
    maxlength: [100, 'State cannot exceed 100 characters']
  },
  country: {
    type: String,
    required: [true, 'Country is required'],
    trim: true,
    maxlength: [100, 'Country cannot exceed 100 characters']
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [0, 0]
    }
  },
  amenities: [{
    type: String,
    trim: true,
    maxlength: [80, 'Amenity cannot exceed 80 characters']
  }],
  photos: [{
    type: String,
    trim: true,
    validate: {
      validator: function(v: string) {
        return /^https?:\/\/.+\.(jpg|jpeg|png|webp|gif)$/i.test(v);
      },
      message: 'Invalid photo URL'
    }
  }],
  pricePerNight: {
    type: Number,
    required: [true, 'Price per night is required'],
    min: [0, 'Price per night must be at least 0']
  },
  cleaningFee: {
    type: Number,
    default: 0,
    min: [0, 'Cleaning fee must be at least 0']
  },
  maxGuests: {
    type: Number,
    required: [true, 'Max guests is required'],
    min: [1, 'Max guests must be at least 1']
  },
  bedrooms: {
    type: Number,
    default: 1,
    min: [0, 'Bedrooms must be at least 0']
  },
  bathrooms: {
    type: Number,
    default: 1,
    min: [0, 'Bathrooms must be at least 0']
  },
  checkInTime: {
    type: String,
    default: '14:00'
  },
  checkOutTime: {
    type: String,
    default: '12:00'
  },
  rules: {
    type: String,
    default: null,
    maxlength: [1000, 'Rules cannot exceed 1000 characters']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, {
  timestamps: true
});

ApartmentSchema.index({ location: '2dsphere' });

export default mongoose.model('Apartment', ApartmentSchema);
