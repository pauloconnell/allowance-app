import mongoose, { Schema } from 'mongoose';

const VehicleSchema = new Schema(
   {
      familyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
      vehicleId: { type: String },
      year: { type: Number, required: true },
      make: { type: String, required: true },
      model: { type: String, required: true },
      nickName: { type: String, required: true },
      mileage: { type: Number },
      vin: { type: String },
   },
   { timestamps: true }
);

export default mongoose.models.Vehicle || mongoose.model('Vehicle', VehicleSchema);
