export interface IChore {
   _id: string;
   familyId: string;
   childId?: string;
   taskName: string;
   notes?: string;
   rewardAmount: number;
   isRecurring: boolean;
   intervalDays?: number;
   suggestedTime?: string;
   dueDate?: Date | string;
   isActive: boolean;
   createdAt?: string;
   updatedAt?: string;
}

export type IChoreInput = Omit<IChore, '_id' | 'createdAt' | 'updatedAt'>;

export type IChoreFormData = Omit<IChoreInput, 'familyId'>;

/**
 * Chore within a DailyRecord
 * Represents a chore assigned to a child for a specific day
 */
export interface IDailyChore {
   choreId: string; // Reference to master Chore
   taskName: string;
   rewardAmount: number;
   completionStatus: 0 | 0.5 | 1; // 0 = not done, 0.5 = partial, 1 = complete
   parentAdjustedReward?: number; // Parent can override reward amount
   isOverridden: boolean;
   notes?: string;
   completionDate?: Date | string;
}

/**
 * Penalty entry in DailyRecord
 */
export interface IPenalty {
   amount: number;
   reason: string;
   appliedBy?: string; // User ID of parent who applied
   appliedAt?: Date | string;
}
