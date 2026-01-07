import mongoose from "mongoose";

const WorkOrderSchema = new mongoose.Schema(
  {
    vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle", required: true },
    serviceType: { type: String, required: true },
    notes: { type: String, default: "" },
    mileage: { type: Number, required: true },
    status: { type: String, enum: ["open", "completed"], default: "open" },
    serviceDueDate: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.models.WorkOrder ||
  mongoose.model("WorkOrder", WorkOrderSchema);
