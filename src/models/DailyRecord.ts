import mongoose, { Schema } from 'mongoose';

const DailyRecordSchema = new Schema(
   {
      familyId: { type: String, required: true, index: true },
      childId: { type: String, required: true, index: true },
      date: { type: Date, required: true, index: true },
      choresList: [
         {
            choreId: { type: String, required: true },
            taskName: { type: String, required: true },
            rewardAmount: { type: Number, required: true, min: 0 },
            completionStatus: {
               type: Number,
               enum: [0, 0.5, 1],
               default: 0,
               required: true,
            },
            parentAdjustedReward: { type: Number, default: null },
            isOverridden: { type: Boolean, default: false },
            notes: { type: String, default: null },
         },
      ],
      isSubmitted: { type: Boolean, default: false, index: true },
      isApproved: { type: Boolean, default: false, index: true },
      submittedAt: { type: Date, default: null },
      approvedAt: { type: Date, default: null },
      approvedBy: { type: String, default: null }, // Auth0 user ID
      penalties: [
         {
            amount: { type: Number, required: true, min: 0 },
            reason: { type: String, required: true },
            appliedBy: { type: String, default: null }, // Auth0 user ID
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

// Compound index for efficient querying
DailyRecordSchema.index({ familyId: 1, childId: 1, date: -1 });
DailyRecordSchema.index({ childId: 1, isSubmitted: 1 });
DailyRecordSchema.index({ childId: 1, isApproved: 1 });

export default mongoose.models.DailyRecord ||
   mongoose.model('DailyRecord', DailyRecordSchema);
