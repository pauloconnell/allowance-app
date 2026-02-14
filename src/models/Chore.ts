import mongoose, { Schema } from 'mongoose';

const ChoreSchema = new Schema(
   {
      // Smart ID: Points to the Family collection
      familyId: { 
         type: Schema.Types.ObjectId, 
         ref: 'Family', 
         required: true, 
         index: true 
      },
      // Smart ID: Points to the Child collection
      childId: { 
         type: Schema.Types.ObjectId, 
         ref: 'Child', 
         index: true 
      },
      taskName: { type: String, required: true },
      notes: { type: String, default: "" },
      rewardAmount: { type: Number, required: true, min: 0 },
      isRecurring: { type: Boolean, default: false },
      intervalDays: { type: Number, default: 1 },
      suggestedTime: { type: String, default: null }, 
      dueDate: { type: String, default: null },
      isActive: { type: Boolean, default: true },
   },
   { timestamps: true }
);

// Optimization: Often we fetch all chores for a specific child within a family
ChoreSchema.index({ familyId: 1, childId: 1 });

export default mongoose.models.Chore || mongoose.model('Chore', ChoreSchema);