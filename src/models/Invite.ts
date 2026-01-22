import mongoose, { Schema } from 'mongoose';

const InviteSchema = new Schema(
   {
      companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
      email: { type: String, required: true, lowercase: true, trim: true },
      role: { type: String, enum: ['admin', 'manager', 'user'], default: 'user' },
      token: { type: String, required: true, unique: true, index: true },
      invitedBy: { type: String, required: true },
      status: { type: String, enum: ['pending', 'accepted', 'expired'], default: 'pending' },
      expiresAt: { type: Date, required: true, index: true },
      acceptedAt: { type: Date, default: null },
   },
   { timestamps: true }
);

export default mongoose.models.Invite || mongoose.model('Invite', InviteSchema);
