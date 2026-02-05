// This represents the "subscription" inside the Child's choresList array
export interface IChildChore {
  choreId: string;      // The ID of the Master Chore blueprint
  dueDate: Date | string; 
  isRecurring: Boolean;
  intervalDays: number;
  taskName: string;
   rewardAmount: number;
   notes?: string;
   completionStatus: 0 | 0.5 | 1; // 0 = not done, 0.5 = partial, 1 = complete
  isActive: boolean;
}

export interface IChild {
   _id: string;
   familyId: string;
   auth0UserId?: string;
   name: string;
   age: number;
   currentBalance: number;
   choresList: IChildChore[]; // 
   avatarUrl?: string;
   createdAt?: string;
   updatedAt?: string;
}

export type IChildInput = Omit<IChild, '_id' | 'createdAt' | 'updatedAt'>;

export type IChildFormData = Omit<IChildInput, 'currentBalance'> & {
   currentBalance?: number;
};

