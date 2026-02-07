import mongoose, { Schema } from 'mongoose';



// 1. The Subdocument Schema: This is the "Instance" of a chore - spawned by Master Chore List for this child's dailyRecord
const ChoreEntrySchema = new Schema({
  choreId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Chore', 
    required: true 
  },
  taskName: { type: String, required: true },
  rewardAmount: { type: Number, required: true, min: 0 },      
  completionStatus: {
    type: Number,
    enum: [0, 0.5, 1], // 0: None, 0.5: Half, 1: Complete
    default: 0,
    required: true,
  },
  isOverridden: { type: Boolean, default: false },
  dueDate: { type: Date, required: true },
  notes: { type: String, default: null },
}, { 
  _id: true, // IMPORTANT: Every entry gets its own unique ID for React keys and targeted updates
  timestamps: { createdAt: true, updatedAt: true } // Helpful to know WHEN a kid marked it done
});

// 2. The Main DailyRecord Schema

const DailyRecordSchema = new Schema(
   {
      // Smart ID: Ref to Family
      familyId: { 
         type: Schema.Types.ObjectId, 
         ref: 'Family', 
         required: true, 
         index: true 
      },
      // Smart ID: Ref to Child
      childId: { 
         type: Schema.Types.ObjectId, 
         ref: 'Child', 
         required: true, 
         index: true 
      },
      dueDate: { type: Date, index: true },
      date: { type: Date, index: true },
      // Use the ChoreSchema as a subdocument array
      choresList: [ChoreEntrySchema],
      copyOfChildChoresSubmitted: [ChoreEntrySchema], // snapshot of chores at submission  by child for reference (immutable after submission)
      isSubmitted: { type: Boolean, default: false, index: true },
      isApproved: { type: Boolean, default: false, index: true },
      submittedAt: { type: Date, default: null },
      approvedAt: { type: Date, default: null },
      
      // Auth0 ID: Stays String
      approvedBy: { type: String, default: null }, 
      
      penalties: [
         {
            amount: { type: Number, required: true, min: 0 },
            reason: { type: String, required: true },
            // Auth0 ID: Stays String
            appliedBy: { type: String, default: null }, 
            appliedAt: { type: Date, default: () => new Date() },
         },
      ],
      totalReward: { type: Number, default: null },
      status: {
         type: String,
         enum: ['pending', 'submitted', 'approved', 'rejected'],
         default: 'pending',
      },
      notes: { type: String, default: '' },
   },
   { timestamps: true }
);

// High-performance compound indexes
DailyRecordSchema.index({ familyId: 1, childId: 1, date: -1 });


export default mongoose.models.DailyRecord ||
   mongoose.model('DailyRecord', DailyRecordSchema);