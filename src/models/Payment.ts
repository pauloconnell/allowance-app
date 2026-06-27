import mongoose, { Schema } from 'mongoose';

const PaymentSchema = new Schema(
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
          required: true, 
         index: true 
      },
      place: { type: String, required: true, default:"home" },
      paymentAmount: { type: Number, required: true, min: 0 },
      previousBalance: { type: Number, required: true },
      notes: { type: String, default: "" },
      paymentDate: { type: String, default:  () => new Date().toISOString().slice(0, 10)  }
      
   },
   { timestamps: true }
);

// Optimization: Often we fetch all payments for a specific child within a family
PaymentSchema.index({ familyId: 1, childId: 1 });

export default mongoose.models.Payment || mongoose.model('Payment', PaymentSchema);