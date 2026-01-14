import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMessage extends Document {
  vitalId: mongoose.Types.ObjectId;
  guardianId: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId; // User ID of the sender
  senderRole: 'VITAL' | 'GUARDIAN';
  message: string;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
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
    senderId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    senderRole: {
      type: String,
      enum: ['VITAL', 'GUARDIAN'],
      required: true,
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster queries
MessageSchema.index({ vitalId: 1, guardianId: 1, createdAt: -1 });
MessageSchema.index({ senderId: 1 });
MessageSchema.index({ read: 1 });

const Message: Model<IMessage> =
  mongoose.models.Message || mongoose.model<IMessage>('Message', MessageSchema);

export default Message;

