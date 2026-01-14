import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IReview extends Document {
  bookingId: mongoose.Types.ObjectId;
  vitalId: mongoose.Types.ObjectId;
  guardianId: mongoose.Types.ObjectId;
  rating: number;
  reviewText?: string; // Renamed from comment for clarity
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      unique: true, // One review per booking - strict enforcement
    },
    vitalId: {
      type: Schema.Types.ObjectId,
      ref: 'VitalProfile',
      required: true,
    },
    guardianId: {
      type: Schema.Types.ObjectId,
      ref: 'GuardianProfile',
      required: true,
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating must be at most 5'],
      validate: {
        validator: Number.isInteger,
        message: 'Rating must be an integer between 1 and 5',
      },
    },
    reviewText: {
      type: String,
      trim: true,
      maxlength: [500, 'Review text must be less than 500 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// Prevent updates after creation (immutable reviews)
ReviewSchema.pre(['updateOne', 'findOneAndUpdate', 'updateMany'], function () {
  throw new Error('Reviews cannot be modified after submission');
});

// Indexes
ReviewSchema.index({ guardianId: 1 });
ReviewSchema.index({ bookingId: 1 });
ReviewSchema.index({ createdAt: -1 });

const Review: Model<IReview> =
  mongoose.models.Review || mongoose.model<IReview>('Review', ReviewSchema);

export default Review;

