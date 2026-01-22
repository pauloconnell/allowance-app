import mongoose, { Schema } from 'mongoose';

const UserCompanySchema = new Schema(
   {
      userId: { type: String, required: true, index: true },
      companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
      role: { type: String, enum: ['admin', 'manager', 'user'], default: 'user' },
      email: { type: String, required: true },
      firstName: { type: String },
      lastName: { type: String },
      isActive: { type: Boolean, default: true },
   },
   { timestamps: true }
);

// Compound index for userId + companyId uniqueness
UserCompanySchema.index({ userId: 1, companyId: 1 }, { unique: true });

export default mongoose.models.UserCompany || mongoose.model('UserCompany', UserCompanySchema);
