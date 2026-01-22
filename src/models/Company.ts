import mongoose, { Schema } from 'mongoose';

const CompanySchema = new Schema(
   {
      name: { type: String, required: true },
      slug: { type: String, required: true, unique: true, index: true },
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

export default mongoose.models.Company || mongoose.model('Company', CompanySchema);
