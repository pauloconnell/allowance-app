import mongoose from "mongoose";

const WorkOrderSchema = new mongoose.Schema(
  {
    vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle", required: true },
    name: { type: String, required: true, },
    serviceType: { type: String, required: true },
    notes: { type: String, default: "" },
       location: [String],
    mileage: { type: Number, required: true },
    status: { type: String, enum: ["open", "completed"], default: "open" },
    serviceDueDate: { type: Date, default: null },
    serviceDueKM: { type: Number, default: null },
    completedDate: { type: Date }, 
    completedBy: { type: String },
    
  },
  { timestamps: true }
);

export default mongoose.models.WorkOrder ||
  mongoose.model("WorkOrder", WorkOrderSchema);
