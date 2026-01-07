import mongoose, { Schema } from "mongoose";

const ServiceRecordSchema = new Schema(
  {
    vehicleId: { type: Schema.Types.ObjectId, ref: "Vehicle" },
    serviceType: String,
   // Completed service date 
    serviceDate: { type: Date }, 
    // Work order due date (optional) 
    serviceDueDate: { type: Date, required: false },
    mileage: Number,
    location: [String],
    notes: String,
  },
  { timestamps: true }
);

export default mongoose.models.ServiceRecord ||
  mongoose.model("ServiceRecord", ServiceRecordSchema);
