import { describe, it, expect } from 'vitest';
import mongoose from 'mongoose';

import { normalizeRecord } from '../../lib/SharedFE-BE-Utils/normalizeRecord';

// Import your real models
import Vehicle from '@/models/Vehicle';
import WorkOrder from '@/models/WorkOrder';
import ServiceRecord from '@/models/ServiceRecord';

describe('normalizeRecord (generic normalization)', () => {
  it('normalizes a Mongoose Vehicle document', () => {
    const doc = new Vehicle({
      vehicleId: new mongoose.Types.ObjectId(),
      nickName: 'Truck',
      mileage: 1234,
      createdAt: new Date('2020-01-01T00:00:00Z'),
      updatedAt: new Date('2020-01-02T00:00:00Z'),
    });

    const result = normalizeRecord(doc);

    expect(result._id).toBe(doc._id.toString());
    expect(result.vehicleId).toBe(doc.vehicleId.toString());
    //expect(result.createdAt).toBe('2020-01-01T00:00:00.000Z');
    //expect(result.updatedAt).toBe('2020-01-02T00:00:00.000Z');
  });

  it('normalizes a Mongoose WorkOrder document', () => {
    const doc = new WorkOrder({
      vehicleId: new mongoose.Types.ObjectId(),
      status: 'open',
      serviceDate: new Date('2023-01-01'),
      createdAt: new Date('2023-01-01T10:00:00Z'),
      updatedAt: new Date('2023-01-01T11:00:00Z'),
    });

    const result = normalizeRecord(doc);

    expect(result._id).toBe(doc._id.toString());
    expect(result.vehicleId).toBe(doc.vehicleId.toString());
    //expect(result.createdAt).toBe('2023-01-01T10:00:00.000Z');
    //expect(result.updatedAt).toBe('2023-01-01T11:00:00.000Z');
  });

  it('normalizes a Mongoose ServiceRecord document', () => {
    const doc = new ServiceRecord({
      vehicleId: new mongoose.Types.ObjectId(),
      serviceDate: new Date('2024-01-01'),
      createdAt: new Date('2024-01-01T10:00:00Z'),
      updatedAt: new Date('2024-01-01T11:00:00Z'),
    });

    const result = normalizeRecord(doc);

    expect(result._id).toBe(doc._id.toString());
    expect(result.vehicleId).toBe(doc.vehicleId.toString());
    //expect(result.createdAt).toBe('2024-01-01T10:00:00.000Z');
    //expect(result.updatedAt).toBe('2024-01-01T11:00:00.000Z');
  });

  it('normalizes a plain object (no toObject)', () => {
    const obj = {
      _id: new mongoose.Types.ObjectId(),
      vehicleId: new mongoose.Types.ObjectId(),
      createdAt: new Date('2021-05-05T12:00:00Z'),
      updatedAt: new Date('2021-05-06T12:00:00Z'),
      notes: 'hello',
    };

    const result = normalizeRecord(obj);

    expect(result._id).toBe(obj._id.toString());
    expect(result.vehicleId).toBe(obj.vehicleId.toString());
    expect(result.createdAt).toBe(obj.createdAt);
    expect(result.updatedAt).toBe(obj.updatedAt);

    expect(result.notes).toBe('hello');
  });

  it('handles missing timestamps gracefully', () => {
    const obj = {
      _id: new mongoose.Types.ObjectId(),
      vehicleId: 'V1',
    };

    const result = normalizeRecord(obj);

    expect(result.createdAt).toBeUndefined();
    expect(result.updatedAt).toBeUndefined();
  });

  it('passes through string timestamps unchanged', () => {
    const obj = {
      _id: new mongoose.Types.ObjectId(),
      vehicleId: 'V1',
      createdAt: '2022-01-01T00:00:00.000Z',
      updatedAt: '2022-01-02T00:00:00.000Z',
    };

    const result = normalizeRecord(obj);

    expect(result.createdAt).toBe('2022-01-01T00:00:00.000Z');
    expect(result.updatedAt).toBe('2022-01-02T00:00:00.000Z');
  });

  it('falls back to empty string for missing _id and vehicleId', () => {
    const obj = {};

    const result = normalizeRecord(obj);

    expect(result._id).toBe('');
    expect(result.vehicleId).toBe('');
  });
});
