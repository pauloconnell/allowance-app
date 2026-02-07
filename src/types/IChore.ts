// ToDo -> refact  using code at bottom of page and update throughout

export interface IChore {
   _id: string;
   familyId: string;
   childId?: string;
   taskName: string;
   notes?: string;
   rewardAmount: number;
   isRecurring: boolean;
   intervalDays?: number;
   completionStatus: 0 | 0.5 | 1; // 0 = not done, 0.5 = partial, 1 = complete
   suggestedTime?: string;
   dueDate: Date | string;
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
   _id?: string; 
   choreId: string; // Reference to master Chore
   taskName: string;
   rewardAmount: number;
   completionStatus: 0 | 0.5 | 1; // 0 = not done, 0.5 = partial, 1 = complete   // Parent can override completion/reward amount in DailyRecord ParentChoresList (which is source of truth for actual payouts)
   isOverridden?: boolean;
   isRecurring: boolean;
   intervalDays?: number; // For recurring chores, how many days until next occurrence
   dueDate: Date | string; // Snapshot of due date at time of assignment
   notes?: string;
   parentNotes?: string; // Notes added by parent during review
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



// Refactor:

// the above will become:
/**
 * Shared properties for both Master Templates and Daily Instances
 */
// export interface IBaseChore {
//    taskName: string;
//    rewardAmount: number;
//    notes?: string;
// }

/**
 * MASTER TEMPLATE (Blueprint)
 * Lives in the 'chores' collection. Used to generate daily tasks.
//  */
// export interface IChore extends IBaseChore {
//    _id: string;
//    familyId: string;
//    childId?: string;
//    isRecurring: boolean;
//    intervalDays?: number;
//    suggestedTime?: string;
//    dueDate: Date | string;
//    isActive: boolean;
//    createdAt?: string;
//    updatedAt?: string;
// }

// /**
//  * DAILY INSTANCE (The "Receipt")
//  * Lives inside a DailyRecord. Includes snapshot data + tracking.
//  */
// export interface IDailyChore extends IBaseChore {
//    choreId: string; // Reference to original master IChore
//    completionStatus: 0 | 0.5 | 1;
//    parentAdjustedReward?: number;
//    isOverridden: boolean;
//    completionDate?: Date | string;
// }

// /**
//  * Utility Types for Forms/Actions
//  */
// export type IChoreInput = Omit<IChore, '_id' | 'createdAt' | 'updatedAt'>;
// export type IChoreFormData = Omit<IChoreInput, 'familyId'>;

// /**
//  * Penalty entry in DailyRecord
//  */
// export interface IPenalty {
//    _id?: string; // Helpful for React list keys
//    amount: number;
//    reason: string;
//    appliedBy?: string;
//    appliedAt: Date | string;
// }