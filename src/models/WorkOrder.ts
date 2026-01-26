import mongoose from 'mongoose';

const WorkOrderSchema = new mongoose.Schema(
   {
      familyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
      vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
      workOrderId: { type: String }, 
      previousWorkOrderId: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkOrder', default: null },
      nickName: { type: String, required: true },
      year: { type: String },
      type: { type: String },
      serviceType: { type: String, required: true },
      notes: { type: String, default: '' },
      location: [String],
      mileage: { type: Number, required: true },
      status: { type: String, enum: ['open', 'completed'], default: 'open' },
      serviceDate: { type: Date, default: null },
      serviceDueDate: { type: Date, default: null },
      serviceDueKM: { type: Number, default: null },
      completedDate: { type: Date },
      completedBy: { type: String },
      isRecurring: { type: Boolean, default: false },
      serviceFrequencyKM: { type: Number, default: null },
      serviceFrequencyWeeks: { type: Number, default: null },
      
   },
   { timestamps: true }
);

export default mongoose.models.WorkOrder || mongoose.model('WorkOrder', WorkOrderSchema);
