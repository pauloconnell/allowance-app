import mongoose, { Schema } from 'mongoose';

const ChoreSchema = new Schema(
   {
      familyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
      taskName: { type: String, required: true },
      rewardAmount: { type: Number, required: true, min: 0 },
      isRecurring: { type: Boolean, default: false },
      intervalDays: { type: Number, default: null },
      suggestedTime: { type: String, default: null }, // e.g., "09:00 AM"
      dueDate: { type: Date, default: null },
      isActive: { type: Boolean, default: true },
   },
   { timestamps: true }
);

export default mongoose.models.Chore || mongoose.model('Chore', ChoreSchema);
