// This represents the "subscription" inside the Child's choresList array
export interface IChildChore {
  choreId: string;      // The ID of the Master Chore blueprint
  nextDue: Date | string; 
  intervalDays: number;
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

