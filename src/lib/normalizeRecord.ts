export function normalizeRecord(doc: any) {
  const obj = doc.toObject ? doc.toObject() : doc;

  return {
    ...obj,
    _id: obj._id?.toString?.() ?? "",
    createdAt: obj.createdAt?.toISOString?.() ?? null,
    updatedAt: obj.updatedAt?.toISOString?.() ?? null,
  };
}
