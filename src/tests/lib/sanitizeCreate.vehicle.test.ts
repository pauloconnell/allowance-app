import { describe, it, expect } from 'vitest';
import Vehicle from '@/models/Vehicle';
import { sanitizeCreate } from '../../lib/utils/sanitizeCreate';

describe('sanitizeCreate (Vehicle schema)', () => {
  it('keeps only fields defined in Vehicle schema', () => {
    const input = {
      vehicleId: 'V-123',
      year: 2020,
      make: 'Ford',
      model: 'F-150',
      nickName: 'Truck',
      mileage: 1234,
      vin: '123456789',
      extraField: 'nope',
    };

    const result = sanitizeCreate( Vehicle, input);

    expect(result).toMatchObject({
      vehicleId: 'V-123',
      year: 2020,
      make: 'Ford',
      model: 'F-150',
      nickName: 'Truck',
      mileage: 1234,
      vin: '123456789',
    });

    expect(result).not.toHaveProperty('extraField');
  });

  it('allows missing required fields (schema will enforce later)', () => {
    const input = {
      make: 'Ford',
      // missing year, model, nickName
    };

    const result = sanitizeCreate(Vehicle, input);

    expect(result).toMatchObject({
      make: 'Ford',
    });
  });
});
