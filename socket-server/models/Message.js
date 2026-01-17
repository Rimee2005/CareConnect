/**
 * Message Model - CommonJS version for Socket.io Server
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MessageSchema = new Schema(
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

const Message = mongoose.models?.Message || mongoose.model('Message', MessageSchema);

module.exports = Message;


