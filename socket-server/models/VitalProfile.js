/**
 * VitalProfile Model - CommonJS version for Socket.io Server
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const VitalProfileSchema = new Schema(
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
      min: [1, 'Age must be at least 1'],
      max: [120, 'Age must be less than 120'],
    },
    gender: {
      type: String,
      required: [true, 'Gender is required'],
      enum: ['Male', 'Female', 'Other', 'Prefer not to say'],
    },
    healthNeeds: {
      type: String,
      required: [true, 'Health needs description is required'],
      trim: true,
    },
    healthTags: {
      type: [String],
      default: [],
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
    contactPreference: {
      type: String,
      required: [true, 'Contact preference is required'],
      enum: ['Phone', 'Email', 'Both'],
    },
    profilePhoto: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
VitalProfileSchema.index({ 'location.city': 1 });
VitalProfileSchema.index({ 'location.coordinates': '2dsphere' });

const VitalProfile = mongoose.models?.VitalProfile || mongoose.model('VitalProfile', VitalProfileSchema);

module.exports = VitalProfile;


