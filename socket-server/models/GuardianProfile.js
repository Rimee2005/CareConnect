/**
 * GuardianProfile Model - CommonJS version for Socket.io Server
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const GuardianProfileSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    age: {
      type: Number,
      required: [true, 'Age is required'],
      min: [18, 'Age must be at least 18'],
      max: [100, 'Age must be less than 100'],
    },
    gender: {
      type: String,
      required: [true, 'Gender is required'],
      enum: ['Male', 'Female', 'Other', 'Prefer not to say'],
    },
    experience: {
      type: Number,
      required: [true, 'Experience is required'],
      min: [0, 'Experience cannot be negative'],
    },
    specialization: {
      type: [String],
      required: [true, 'At least one specialization is required'],
      validate: {
        validator: (v) => v.length > 0,
        message: 'At least one specialization is required',
      },
    },
    careTags: {
      type: [String],
      default: [],
    },
    introduction: {
      type: String,
      trim: true,
      maxlength: [300, 'Introduction must be less than 300 characters'],
    },
    experienceBreakdown: {
      type: [{
        years: { type: Number, required: true, min: 0 },
        type: { type: String, required: true, trim: true },
      }],
      default: [],
    },
    availability: {
      days: {
        type: [String],
        required: true,
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      },
      hours: {
        start: {
          type: String,
          required: true,
        },
        end: {
          type: String,
          required: true,
        },
      },
      shiftType: {
        type: String,
        enum: ['Morning', 'Night', '24×7'],
      },
    },
    languages: {
      type: [String],
      default: [],
    },
    serviceRadius: {
      type: Number,
      required: [true, 'Service radius is required'],
      min: [1, 'Service radius must be at least 1 km'],
    },
    location: {
      city: {
        type: String,
        required: [true, 'City is required'],
        trim: true,
      },
      coordinates: {
        lat: Number,
        lng: Number,
      },
    },
    certifications: {
      type: [String],
      default: [],
    },
    profilePhoto: {
      type: String,
      default: '',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationBadges: {
      idVerified: { type: Boolean, default: false },
      certificationUploaded: { type: Boolean, default: false },
      highlyRated: { type: Boolean, default: false },
      repeatBookings: { type: Boolean, default: false },
    },
    pricing: {
      hourly: { type: Number, min: 0 },
      daily: { type: Number, min: 0 },
      monthly: { type: Number, min: 0 },
      priceBreakdown: { type: String, trim: true, maxlength: [500, 'Price breakdown must be less than 500 characters'] },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
GuardianProfileSchema.index({ specialization: 1 });
GuardianProfileSchema.index({ careTags: 1 });
GuardianProfileSchema.index({ languages: 1 });
GuardianProfileSchema.index({ isVerified: 1 });
GuardianProfileSchema.index({ 'location.city': 1 });
GuardianProfileSchema.index({ 'location.coordinates': '2dsphere' });

const GuardianProfile = mongoose.models?.GuardianProfile || mongoose.model('GuardianProfile', GuardianProfileSchema);

module.exports = GuardianProfile;


