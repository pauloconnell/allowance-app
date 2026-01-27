// this normalizes chore, daily record, and child records for use in frontend
// ie we use id's in URLs in the frontend - params must be strings, not ObjectId types

export function normalizeRecord<T extends Record<string, any>>(doc: T) {
  const obj = doc.toObject ? doc.toObject() : doc;

  const normalized: Record<string, any> = {
    ...obj,
    _id: obj._id?.toString() ?? "",
  };

  // Normalize known foreign keys only if they exist
  if (obj.familyId) normalized.familyId = obj.familyId.toString();
  if (obj.childId) normalized.childId = obj.childId.toString();
  if (obj.choreId) normalized.choreId = obj.choreId.toString();


  return normalized as T;
}
