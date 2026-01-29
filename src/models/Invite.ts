import mongoose, { Schema } from 'mongoose';

const InviteSchema = new Schema(
   {
      // Smart ID: Ref to Family
      familyId: { 
         type: Schema.Types.ObjectId, 
         ref: 'Family', 
         required: true, 
         index: true 
      },
      email: { type: String, required: true, lowercase: true, trim: true },
      role: { type: String, enum: ['parent', 'child'], default: 'child' },
      token: { type: String, required: true, unique: true, index: true },
      
      // Auth0 ID: Stays String
      invitedBy: { type: String, required: true }, 
      
      status: { 
         type: String, 
         enum: ['pending', 'accepted', 'expired'], 
         default: 'pending' 
      },
      // TTL Index: Mongo will auto-delete this doc when it expires
      expiresAt: { type: Date, required: true, index: { expires: 0 } },
      acceptedAt: { type: Date, default: null },
   },
   { timestamps: true }
);

// Prevent redundant pending invites for the same email in the same family
InviteSchema.index({ familyId: 1, email: 1, status: 1 }, { 
  unique: true, 
  partialFilterExpression: { status: 'pending' } 
});

export default mongoose.models.Invite || mongoose.model('Invite', InviteSchema);