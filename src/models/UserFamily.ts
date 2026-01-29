import mongoose, { Schema } from 'mongoose';

const UserFamilySchema = new Schema(
   {
      // Auth0 ID - String is correct
      userId: { type: String, required: true, index: true }, 
      
      // Smart ID - Ref to Family for .populate()
      familyId: { 
         type: Schema.Types.ObjectId, 
         ref: 'Family', 
         required: true,
         index: true // Added index for reverse lookups (e.g. "Who are all parents in this family?")
      }, 
      
      role: { type: String, enum: ['parent', 'child'], default: 'parent' },
      
      // Normalized Email
      email: { 
         type: String, 
         required: true, 
         lowercase: true, 
         trim: true,
         index: true 
      },
      
      firstName: { type: String },
      lastName: { type: String },
      isActive: { type: Boolean, default: true },
   },
   { timestamps: true }
);

// This ensures a user can't be added to the SAME family twice
UserFamilySchema.index({ userId: 1, familyId: 1 }, { unique: true });

export default mongoose.models.UserFamily || mongoose.model('UserFamily', UserFamilySchema);