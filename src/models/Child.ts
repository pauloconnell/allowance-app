import mongoose, { Schema } from 'mongoose';

// 1. Define the Sub-Schema first
const ChildChoreSchema = new Schema({
  choreId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Chore', 
    required: true 
  },
  nextDue: { 
    type: Date, 
    required: true,
    default: Date.now 
  },
  intervalDays: { 
    type: Number, 
    default: 1 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  }
}, { _id: true }); // We keep _id: true so we can uniquely identify an assignment if needed

// 2. Define the Main Schema
const ChildSchema = new Schema(
   {
      familyId: {
         type: Schema.Types.ObjectId,
         ref: 'Family',
         required: true,
         index: true
      },
      userId: {
         type: String,
         default: null,
         index: true
      },
      name: { type: String, required: true },
      age: { type: Number, required: true },
      currentBalance: { type: Number, default: 0, required: true },
      avatarUrl: { type: String, default: null },
      // Use the sub-schema here
      choresList: [ChildChoreSchema] 
   },
   { timestamps: true }
);

// Indexes
ChildSchema.index({ familyId: 1, userId: 1 });

export default mongoose.models.Child || mongoose.model('Child', ChildSchema);