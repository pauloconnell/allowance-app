export function sanitizeUpdate<T extends Record<string, any>>(
   model: any,
   body: Partial<T>
): Partial<T> {
   // Block MongoDB operators
   if (Object.keys(body).some((k) => k.startsWith('$'))) {
      throw new Error('Invalid update payload');
   }

   // Extract allowed fields from schema
   const allowed = Object.keys(model.schema.paths).filter(
      (key) =>
         !key.startsWith('_') && // ignore _id, __v
         key !== 'createdAt' &&
         key !== 'updatedAt'
   );

   // Identify numeric fields from the schema
   const numericFields = Object.entries(model.schema.paths)
      .filter(([_, path]: any) => path.instance === 'Number')
      .map(([key]) => key);

   // Build sanitized object
   const sanitized: Partial<T> = {};

   for (const key of allowed) {
      if (!(key in body)) continue;
      let value = body[key as keyof T];
      // Normalize numeric fields ->mongodb will blow up if it tries to convert 'null' to a number
      if (numericFields.includes(key)) {
         if (value === '' || value === null || value === 'null') {
            continue; // skip this field entirely
         } else {
            const num = Number(value);
            if (Number.isNaN(num)) continue;    // ensure no letters are going to blow up in db(don't ever store NaN )
            value = num as T[keyof T];
         }
      }
      sanitized[key as keyof T] = value;
   }

   return sanitized;
}
