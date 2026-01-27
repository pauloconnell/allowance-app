import mongoose, { Schema } from 'mongoose';

const ChildSchema = new Schema(
   {
      familyId: { type: String, required: true, index: true },
      userId: { type: String, default: null, index: true }, // Auth0 user ID for the child
      name: { type: String, required: true },
      age: { type: Number, required: true },
      currentBalance: { type: Number, default: 0, required: true },
      avatarUrl: { type: String, default: null },
   },
   { timestamps: true }
);

// Compound index for quick lookups
ChildSchema.index({ familyId: 1, userId: 1 });

export default mongoose.models.Child || mongoose.model('Child', ChildSchema);
