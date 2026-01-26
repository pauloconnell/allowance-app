export interface IChild {
   _id: string;
   familyId: string;
   auth0UserId?: string;
   name: string;
   age: number;
   currentBalance: number;
   avatarUrl?: string;
   createdAt?: string;
   updatedAt?: string;
}

export type IChildInput = Omit<IChild, '_id' | 'createdAt' | 'updatedAt'>;

export type IChildFormData = Omit<IChildInput, 'currentBalance'> & {
   currentBalance?: number;
};
