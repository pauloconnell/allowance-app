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


  // need to get into the choreList and normalize those too:
for (const key in normalized) {
    const value = normalized[key];

    // Handle Dates (Next.js can't pass raw Date objects)
    if (value instanceof Date) {
      normalized[key] = value.toISOString();
    } 
    // Handle Nested Arrays (like choresList)
    else if (Array.isArray(value)) {
      normalized[key] = value.map(item => 
        (typeof item === 'object' && item !== null) ? normalizeRecord(item) : item
      );
    }
    // Handle nested ObjectIds that aren't in our "keysToStringify" list
    else if (value && value._bsontype === 'ObjectID') {
      normalized[key] = value.toString();
    }
  }


  return normalized as T;
}
