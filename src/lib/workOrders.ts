import { connectDB } from "./mongodb";
import WorkOrder from "@/models/WorkOrder";
import { IWorkOrder } from "@/types/IWorkOrder";


export async function createWorkOrder(data:Partial<IWorkOrder>): Promise<IWorkOrder> {
  await connectDB();
  const wo = await WorkOrder.create(data);
  return {
    ...wo.toObject(),
    _id: wo._id.toString(),
    createdAt: wo?.createdAt?.toISOString(),
    updatedAt: wo?.updatedAt?.toISOString(),
  };
}



export async function getWorkOrdersForVehicle(vehicleId: string):Promise<IWorkOrder[]> {
  await connectDB();
  const workOrders = await WorkOrder.find({ vehicleId, status: "open", }).sort({ createdAt: -1 }).lean();
  return workOrders.map((wo) => ({
    ...wo,
    _id: wo._id?.toString(),
    vehicleId: wo.vehicleId?.toString(),
    createdAt: wo.createdAt?.toISOString() ?? null,
    updatedAt: wo.updatedAt?.toISOString() ?? null,
  }));
}


export async function deleteWorkOrder(id: string) {
  await connectDB();

  const deleted = await WorkOrder.findOneAndDelete({
    $or: [{ _id: id }, { workOrderId: id }],
  }).lean();

  return deleted
    ? {
        ...deleted,
        _id: deleted._id.toString(),
        vehicleId: deleted.vehicleId?.toString() ?? "",
      }
    : null;
}
