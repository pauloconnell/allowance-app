import mongoose, { Schema } from "mongoose";

const ServiceRecordSchema = new Schema(
  {
    vehicleId: { type: Schema.Types.ObjectId, ref: "Vehicle" },
    serviceType: String,
   // Completed service date 
    serviceDate: { type: Date }, 
    // Work order due date (optional) 
    serviceDueDate: { type: Date, required: false },
     serviceDueKM: { type: Number, required: false },
    mileage: Number,
    location: [String],
    notes: String,
    completedBy: { type: String },
    serviceFrequencyKM: { type: Number, default: null },
    serviceFrequencyWeeks: { type: Number, default: null },

  },
  { timestamps: true }
);

export default mongoose.models.ServiceRecord ||
  mongoose.model("ServiceRecord", ServiceRecordSchema);
