import { connectDB } from "./mongodb";
import WorkOrder from "@/models/WorkOrder";
import { IWorkOrder } from "@/types/IWorkOrder";


export async function createWorkOrder(data:Partial<IWorkOrder>): Promise<IWorkOrder> {
  await connectDB();
  const wo = await WorkOrder.create(data);
  return {
    ...wo.toObject(),
    _id: wo._id.toString(),
    companyId: wo.companyId?.toString?.() ?? '',
    createdAt: wo?.createdAt?.toISOString(),
    updatedAt: wo?.updatedAt?.toISOString(),
  };
}

export async function getAllWorkOrders(companyId: string): Promise<IWorkOrder[]> {
  await connectDB();
  const workOrders = await WorkOrder.find({ companyId }).sort({ createdAt: -1 }).lean();
  return workOrders.map((wo) => ({
    ...wo,
    _id: wo._id?.toString(),
    companyId: wo.companyId?.toString?.() ?? '',
    vehicleId: wo.vehicleId?.toString(),
    createdAt: wo.createdAt?.toISOString() ?? null,
    updatedAt: wo.updatedAt?.toISOString() ?? null,
  }));
}

export async function getWorkOrdersForVehicle(vehicleId: string, companyId?: string):Promise<IWorkOrder[]> {
  await connectDB();
  const query: any = { vehicleId, status: "open" };
  if (companyId) {
    query.companyId = companyId;
  }
  const workOrders = await WorkOrder.find(query).sort({ createdAt: -1 }).lean();
  return workOrders.map((wo) => ({
    ...wo,
    _id: wo._id?.toString(),
    companyId: wo.companyId?.toString?.() ?? '',
    vehicleId: wo.vehicleId?.toString(),
    createdAt: wo.createdAt?.toISOString() ?? null,
    updatedAt: wo.updatedAt?.toISOString() ?? null,
  }));
}


export async function deleteWorkOrder(id: string, companyId?: string) {
  await connectDB();

  const query: any = {
    $or: [{ _id: id }, { workOrderId: id }],
  };
  
  if (companyId) {
    query.companyId = companyId;
  }

  const deleted = await WorkOrder.findOneAndDelete(query).lean();

  return deleted
    ? {
        ...deleted,
        _id: deleted._id.toString(),
        companyId: deleted.companyId?.toString?.() ?? '',
        vehicleId: deleted.vehicleId?.toString() ?? "",
      }
    : null;
}
