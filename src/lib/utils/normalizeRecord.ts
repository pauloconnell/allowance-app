// this normalizes chore, daily record, and child records for use in frontend
// ie we use id's in URLs in the frontend - params must be strings, not ObjectId types

export function normalizeRecord<T extends Record<string, any>>(doc: T) {
  //  Convert Mongoose to Plain Object
  const obj = doc.toObject ? doc.toObject() : doc;

  const normalized: Record<string, any> = {
    ...obj,
    id: obj._id?.toString() ?? "", // Add a standard String 'id' field for frontend use
    _id: obj._id?.toString() ?? "",
  };

  // Normalize known foreign keys only if they exist (schemas keep these as objectIds for efficient querries)
  if (obj.familyId) normalized.familyId = obj.familyId.toString();
  if (obj.childId) normalized.childId = obj.childId.toString();
  if (obj.choreId) normalized.choreId = obj.choreId.toString();
  if (obj.userId) normalized.userId = obj.userId.toString();

//  The "Light" Recursion: Handle nested arrays (like choresList)
  for (const key in normalized) {
    if (Array.isArray(normalized[key])) {
      normalized[key] = normalized[key].map((item: any) => 
        typeof item === 'object' && item !== null ? normalizeRecord(item) : item
      );
    }
  }


  return normalized as T;
}
