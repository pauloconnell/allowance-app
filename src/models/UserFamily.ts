import mongoose, { Schema } from 'mongoose';

const UserFamilySchema = new Schema(
   {
      userId: { type: String, required: true, index: true },
      familyId: { type: Schema.Types.ObjectId, ref: 'Family', required: true, index: true },
      role: { type: String, enum: ['parent', 'child'], default: 'child' },
      email: { type: String, required: true },
      firstName: { type: String },
      lastName: { type: String },
      isActive: { type: Boolean, default: true },
   },
   { timestamps: true }
);

// Compound index for userId + companyId uniqueness
UserFamilySchema.index({ userId: 1, companyId: 1 }, { unique: true });

export default mongoose.models.UserFamily || mongoose.model('UserFamily', UserFamilySchema);
