// this normalizes chore, daily record, and child records for use in frontend

export function normalizeRecord<T extends Record<string, any>>(doc: T) {
  const obj = doc.toObject ? doc.toObject() : doc;

  return {
    ...obj,
    _id: obj._id?.toString() ?? "",
    childId: obj.childId?.toString() ?? obj.childId ?? "",
    choreId: obj.choreId?.toString() ?? obj.choreId ?? "",
    familyId: obj.familyId?.toString() ?? obj.familyId ?? "",
    // Legacy aliases for backward compatibility
    vehicleId: obj.childId?.toString() ?? obj.vehicleId ?? "",
    familyId: obj.familyId?.toString() ?? obj.familyId ?? "",
  };
}
