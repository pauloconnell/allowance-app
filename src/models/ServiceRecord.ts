import mongoose, { Schema } from 'mongoose';

const ServiceRecordSchema = new Schema(
   {
      companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
      vehicleId: { type: Schema.Types.ObjectId, ref: 'Vehicle', required: true },
      workOrderId: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkOrder' },

      serviceType: { type: String, required: true }, 
      // Completed service date 
      serviceDate: { type: Date, required: true },
      // Work order due date (optional)
      serviceDueDate: { type: Date, required: false },
      serviceDueKM: { type: Number, required: false },
      mileage: { type: Number, required: false },
      location: [String],
      notes: String,
      completedBy: { type: String },
      serviceFrequencyKM: { type: Number, default: null },
      serviceFrequencyWeeks: { type: Number, default: null },
      isRecurring: { type: Boolean, default: false },
   },
   { timestamps: true }
);

export default mongoose.models.ServiceRecord ||
   mongoose.model('ServiceRecord', ServiceRecordSchema);
