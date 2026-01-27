import mongoose, { Schema } from 'mongoose';

const UserFamilySchema = new Schema(
   {
      userId: { type: String, required: true, index: true },   // auth0 string
      familyId: { type: Schema.Types.ObjectId, ref: 'Family', required: true }, // keep all mongodb ids ObjectId to allow .populate
      role: { type: String, enum: ['parent', 'child'], default: 'parent' },
      email: { type: String, required: true },
      firstName: { type: String },
      lastName: { type: String },
      isActive: { type: Boolean, default: true },
   },
   { timestamps: true }
);

// Compound index for userId + familyId uniqueness
UserFamilySchema.index({ userId: 1, familyId: 1 }, { unique: true });

export default mongoose.models.UserFamily || mongoose.model('UserFamily', UserFamilySchema);
