import { describe, it, expect } from 'vitest';
import WorkOrder from '@/models/WorkOrder';
import { sanitizeCreate } from '../../lib/utils/sanitizeCreate';

describe('sanitizeCreate (WorkOrder schema)', () => {
  it('keeps only fields defined in WorkOrder schema', () => {
    const input = {
      vehicleId: '656f9c9f9f9f9f9f9f9f9f9f',
      nickName: 'Oil change',
      year: '2020',
      type: 'Maintenance',
      serviceType: 'Oil',
      notes: 'urgent',
      location: ['Bay 1'],
      mileage: 5000,
      status: 'open',
      serviceDate: new Date('2024-01-19T00:00:00Z'),
      serviceDueDate: new Date('2024-02-01T00:00:00Z'),
      serviceDueKM: 8000,
      completedDate: null,
      completedBy: 'Tech',
      isRecurring: true,
      serviceFrequencyKM: 5000,
      serviceFrequencyWeeks: 12,
      extraField: 'nope',
    };

    const result = sanitizeCreate(WorkOrder, input );

    expect(result).toMatchObject({
      vehicleId: input.vehicleId,
      nickName: 'Oil change',
      year: '2020',
      type: 'Maintenance',
      serviceType: 'Oil',
      notes: 'urgent',
      location: ['Bay 1'],
      mileage: 5000,
      status: 'open',
      serviceDate: input.serviceDate,
      serviceDueDate: input.serviceDueDate,
      serviceDueKM: 8000,
      completedDate: null,
      completedBy: 'Tech',
      isRecurring: true,
      serviceFrequencyKM: 5000,
      serviceFrequencyWeeks: 12,
    });

    expect(result).not.toHaveProperty('extraField');
  });

  it('allows missing required fields (schema will enforce later)', () => {
    const input = {
      vehicleId: '656f9c9f9f9f9f9f9f9f9f9f',
      // missing name, serviceType, mileage
    };

    const result = sanitizeCreate(WorkOrder, input );

    expect(result).toMatchObject({
      vehicleId: input.vehicleId,
    });
  });
});
