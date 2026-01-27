import { describe, it, expect } from 'vitest';
import ServiceRecord from '@/models/ServiceRecord';
import { sanitizeCreate } from '../../lib/utils/sanitizeCreate';

describe('sanitizeCreate (ServiceRecord schema)', () => {
  it('keeps only fields defined in ServiceRecord schema', () => {
    const input = {
      vehicleId: '656f9c9f9f9f9f9f9f9f9f9f',
      workOrderId: '656f9c9f9f9f9f9f9f9f9f9e',
      serviceType: 'Oil',
      serviceDate: new Date('2024-01-19T00:00:00Z'),
      serviceDueDate: new Date('2024-02-01T00:00:00Z'),
      serviceDueKM: 8000,
      mileage: 5000,
      location: ['Bay 1'],
      notes: 'done',
      completedBy: 'Tech',
      serviceFrequencyKM: 5000,
      serviceFrequencyWeeks: 12,
      isRecurring: true,
      extraField: 'nope',
    };

    const result = sanitizeCreate(ServiceRecord,input );

    expect(result).toMatchObject({
      vehicleId: input.vehicleId,
      workOrderId: input.workOrderId,
      serviceType: 'Oil',
      serviceDate: input.serviceDate,
      serviceDueDate: input.serviceDueDate,
      serviceDueKM: 8000,
      mileage: 5000,
      location: ['Bay 1'],
      notes: 'done',
      completedBy: 'Tech',
      serviceFrequencyKM: 5000,
      serviceFrequencyWeeks: 12,
      isRecurring: true,
    });

    expect(result).not.toHaveProperty('extraField');
  });

  it('allows missing required fields (schema will enforce later)', () => {
    const input = {
      vehicleId: '656f9c9f9f9f9f9f9f9f9f9f',
      // missing serviceType, serviceDate
    };

    const result = sanitizeCreate(ServiceRecord,input );

    expect(result).toMatchObject({
      vehicleId: input.vehicleId,
    });
  });
});
