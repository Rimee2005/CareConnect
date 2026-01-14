import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IGuardianProfile extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  age: number;
  gender: string;
  experience: number; // years
  specialization: string[];
  availability: {
    days: string[];
    hours: {
      start: string;
      end: string;
    };
  };
  serviceRadius: number; // km
  certifications: string[]; // Cloudinary URLs
  profilePhoto?: string;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const GuardianProfileSchema = new Schema<IGuardianProfile>(
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
        validator: (v: string[]) => v.length > 0,
        message: 'At least one specialization is required',
      },
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
    },
    serviceRadius: {
      type: Number,
      required: [true, 'Service radius is required'],
      min: [1, 'Service radius must be at least 1 km'],
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
  },
  {
    timestamps: true,
  }
);

// Indexes for search
GuardianProfileSchema.index({ userId: 1 });
GuardianProfileSchema.index({ specialization: 1 });
GuardianProfileSchema.index({ isVerified: 1 });

const GuardianProfile: Model<IGuardianProfile> =
  mongoose.models.GuardianProfile ||
  mongoose.model<IGuardianProfile>('GuardianProfile', GuardianProfileSchema);

export default GuardianProfile;

