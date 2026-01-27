import mongoose, { Schema } from 'mongoose';

const ChildSchema = new Schema(
   {
      familyId: { type: Schema.Types.ObjectId, ref: 'Family', required: true, index: true },
      userId: { type: String, default: null, index: true }, // Auth0 user ID for the child
      name: { type: String, required: true },
      age: { type: Number, required: true },
      currentBalance: { type: Number, default: 0, required: true },
      avatarUrl: { type: String, default: null },
   },
   { timestamps: true }
);

// Compound index for quick lookups
ChildSchema.index({ familyId: 1, auth0UserId: 1 });

export default mongoose.models.Child || mongoose.model('Child', ChildSchema);
