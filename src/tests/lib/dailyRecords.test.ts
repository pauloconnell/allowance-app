import { describe, it, expect } from 'vitest';
import { computePayoutTotals } from '@/lib/dailyRecords';

describe('computePayoutTotals', () => {
   it('calculates totals with no overrides or penalties', () => {
      const record = {
         choresList: [
            { rewardAmount: 5, completionStatus: 1, isOverridden: false },
            { rewardAmount: 3, completionStatus: 0.5, isOverridden: false },
         ],
         penalties: [],
      };

      const res = computePayoutTotals(record as any);

      expect(res.totalChoreReward).toBeCloseTo(5 + 1.5);
      expect(res.totalPenalties).toBe(0);
      expect(res.netPayout).toBeCloseTo(6.5);
   });

   it('honors parentAdjustedReward when overridden', () => {
      const record = {
         choresList: [
            { rewardAmount: 5, completionStatus: 1, isOverridden: true, parentAdjustedReward: 4 },
            { rewardAmount: 2, completionStatus: 1, isOverridden: false },
         ],
         penalties: [],
      };

      const res = computePayoutTotals(record as any);

      expect(res.totalChoreReward).toBeCloseTo(4 + 2);
      expect(res.netPayout).toBeCloseTo(6);
   });

   it('subtracts penalties and floors at zero', () => {
      const record = {
         choresList: [
            { rewardAmount: 1, completionStatus: 0, isOverridden: false },
         ],
         penalties: [{ amount: 2, reason: 'Late' }],
      };

      const res = computePayoutTotals(record as any);

      expect(res.totalChoreReward).toBe(0);
      expect(res.totalPenalties).toBe(2);
      expect(res.netPayout).toBe(0);
   });
});
