import mongoose, { Schema } from 'mongoose';

const ChildSchema = new Schema(
   {
     
      familyId: { 
         type: Schema.Types.ObjectId, 
         ref: 'Family', 
         required: true, 
         index: true 
      },
      // KEPT AS STRING: Auth0 IDs are strings (e.g., 'auth0|123')
      userId: { 
         type: String, 
         default: null, 
         index: true 
      }, 
      name: { type: String, required: true },
      age: { type: Number, required: true },
      currentBalance: { type: Number, default: 0, required: true },
      avatarUrl: { type: String, default: null },
   },
   { timestamps: true }
);


ChildSchema.index({ familyId: 1, userId: 1 });

export default mongoose.models.Child || mongoose.model('Child', ChildSchema);