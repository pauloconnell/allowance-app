import mongoose, { Schema } from 'mongoose';

const FamilySchema = new Schema(
   {
      name: { type: String, required: true },
      userId: { type: String, required: true, index: true },   // string from auth0
      //slug: { type: String, required: true, index: true },
      description: { type: String, default: '' },
      email: { type: String },
      phone: { type: String },
      address: { type: String },
      city: { type: String },
      state: { type: String },
      zipCode: { type: String },
      country: { type: String },
      logo: { type: String },
      isActive: { type: Boolean, default: true },
   },
   { timestamps: true }
);

// user can't have 2 families with same slug, but diff users can FamilySchema.index({ userId: 1, slug: 1 }, { unique: true });

// If a user can only own ONE family, we make userId unique.
// If they can own multiple, we keep it as a standard index.
FamilySchema.index({ userId: 1 });

export default mongoose.models.Family || mongoose.model('Family', FamilySchema);
