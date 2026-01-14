import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISavedGuardian extends Document {
  vitalId: mongoose.Types.ObjectId;
  guardianId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const SavedGuardianSchema = new Schema<ISavedGuardian>(
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
  },
  {
    timestamps: true,
  }
);

// Ensure unique combination of vital and guardian
SavedGuardianSchema.index({ vitalId: 1, guardianId: 1 }, { unique: true });
SavedGuardianSchema.index({ vitalId: 1 });
SavedGuardianSchema.index({ guardianId: 1 });

const SavedGuardian: Model<ISavedGuardian> =
  mongoose.models.SavedGuardian || mongoose.model<ISavedGuardian>('SavedGuardian', SavedGuardianSchema);

export default SavedGuardian;

