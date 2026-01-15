import mongoose, { Schema, Document, Model } from 'mongoose';

export type BookingStatus = 'PENDING' | 'ACCEPTED' | 'ONGOING' | 'COMPLETED' | 'REJECTED';

export interface IBooking extends Document {
  vitalId: mongoose.Types.ObjectId;
  guardianId: mongoose.Types.ObjectId;
  status: BookingStatus;
  startDate?: Date;
  endDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
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
    status: {
      type: String,
      enum: ['PENDING', 'ACCEPTED', 'ONGOING', 'COMPLETED', 'REJECTED'],
      default: 'PENDING',
      required: true,
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster queries
BookingSchema.index({ vitalId: 1 });
BookingSchema.index({ guardianId: 1 });
BookingSchema.index({ status: 1 });
BookingSchema.index({ createdAt: -1 });

const Booking: Model<IBooking> =
  (mongoose.models && mongoose.models.Booking) || mongoose.model<IBooking>('Booking', BookingSchema);

export default Booking;

