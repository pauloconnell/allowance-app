export function sanitizeCreate<T>(model: any, body: unknown): Partial<T>  {
   
  // narrow type
  if (typeof body !== 'object' || body === null) { 
    throw new Error('Invalid create payload'); }

    const input = body as Record<string, any>;

  // Block MongoDB operators
   if (Object.keys(input).some((k) => k.startsWith('$'))) {
      throw new Error('Invalid create payload');
   }

   // Allowed fields come from the schema
   const allowed = Object.keys(model.schema.paths)?.filter(
      (key) => !key.startsWith('_') && key !== 'createdAt' && key !== 'updatedAt'
   );


   const sanitized: Record<string, any> = {};

   for (const key of allowed) {
      if (input[key] !== undefined) sanitized[key] = input[key];
   }

 return sanitized as Partial<T>;
}
