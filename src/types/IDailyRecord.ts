import { IDailyChore, IPenalty } from './IChore';

export type DailyRecordStatus = 'pending' | 'submitted' | 'approved' | 'rejected';

export interface IDailyRecord {
   _id: string;
   familyId: string;
   childId: string;
   date: Date | string;
   dueDate: Date | string;
   choresList: IDailyChore[];
   isSubmitted: boolean;
   isApproved: boolean;
   submittedAt?: Date | string;
   approvedAt?: Date | string;
   approvedBy?: string; // User ID of parent
   penalties: IPenalty[];
   totalReward?: number; // Calculated: sum of rewards after adjustments and penalties
   status: DailyRecordStatus;
   notes?: string;
   createdAt?: string;
   updatedAt?: string;
}

export type IDailyRecordInput = Omit<
   IDailyRecord,
   '_id' | 'createdAt' | 'updatedAt' | 'totalReward'
>;

export interface IDailyRecordFormData {
   choresList: IDailyChore[];
   notes?: string;
}

/**
 * Parent review payload for approving a daily record
 */
export interface IParentReview {
   dailyRecordId: string;
   choreAdjustments: Array<{
      choreIndex: number;
      parentAdjustedReward?: number;
      isOverridden: boolean;
   }>;
   penalties: IPenalty[];
   approve: boolean;
   notes?: string;
}

/**
 * Response from payout calculation
 */
export interface IPayoutResult {
   totalChoreReward: number;
   totalPenalties: number;
   netPayout: number;
   childNewBalance: number;
}
