import { IDailyChore, IPenalty } from './IChore';

export type DailyRecordStatus = 'pending' | 'submitted' | 'approved' | 'rejected';

export type { IDailyChore };

export interface IDailyRecord {
   _id: string;
   familyId: string;
   childId: string;
   date: Date | string;
   dueDate: Date | string;
   choresList: IDailyChore[];
   copyOfChildChoresSubmitted: IDailyChore[]; // Snapshot of chore details submitted for ref - saved at end of day and copied to choresList for parent to update and award actual earnings upon 'approval'
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
 * Parent review **payload** TYPE for approving a daily record
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
