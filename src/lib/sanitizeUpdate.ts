export function sanitizeUpdate(model: any, body: Record<string, any>) {
  // Block MongoDB operators
  if (Object.keys(body).some((k) => k.startsWith("$"))) {
    throw new Error("Invalid update payload");
  }

  // Extract allowed fields from schema
  const allowed = Object.keys(model.schema.paths).filter(
    (key) =>
      !key.startsWith("_") && // ignore _id, __v
      key !== "createdAt" &&
      key !== "updatedAt"
  );

  // Build sanitized object
  const sanitized: Record<string, any> = {};

  for (const key of allowed) {
    if (key in body) sanitized[key] = body[key];
  }

  return sanitized;
}
