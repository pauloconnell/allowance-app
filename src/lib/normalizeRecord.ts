// this normalizes workorder service record and vehicle for use in front end

export function normalizeRecord<T extends Record<string, any>>(doc: T) {
  const obj = doc.toObject ? doc.toObject() : doc;

  return {
    ...obj,
    _id: obj._id?.toString() ?? "",
    vehicleId: obj.vehicleId?.toString() ?? obj.vehicleId ?? "",
    
    //createdAt: obj.createdAt?.toISOString() ?? null,
    //updatedAt: obj.updatedAt?.toISOString() ?? null,
  };
}
