import mongoose, { Schema } from 'mongoose';

// 1. Define the Sub-Schema first
const ChildChoreSchema = new Schema({ // this is just keeping data on the current assigned chores -> all data about chores are edited on Chore model itself
  choreId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Chore', 
    required: true 
  },
  taskName: {
    type: String,
    required: true
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  dueDate: {
    type: Date,
    default: null
  },
  nextDue: { 
    type: Date, 
    default: Date.now 
  },
  intervalDays: { 
    type: Number, 
    default: 1 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  notes: {
    type: String,
    default: ''
  },
  parentNotes: {
    type: String,
    default: ''
  },
   completionStatus: {// 0 = not done, 0.5 = partial, 1 = complete
      type: Number,
      enum: [0, 0.5, 1],
      default: 0
   }, 
   rewardAmount: {  // total possible
      type: Number,
      default: 0
   },
   rewardEarned: {    // actual amount earned
      type: Number,
      default: 0
    }


}, { _id: true }); // We keep _id: true so we can uniquely identify an instance of Chore if needed

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
      choresList: [ChildChoreSchema]        // Chore db handles master data for chore
   },                                       // child DB choreList handles INSTANCE details about each chore for this child
   { timestamps: true }
);

// Indexes
ChildSchema.index({ familyId: 1, userId: 1 });

export default mongoose.models.Child || mongoose.model('Child', ChildSchema);