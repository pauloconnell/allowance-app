export interface IUserFamily {
   _id: string;
   userId: string;
   familyId: string;
   role: 'admin' | 'manager' | 'user';
   email: string;
   firstName?: string;
   lastName?: string;
   isActive: boolean;
   createdAt: string;
   updatedAt: string;
}

export type IUserFamilyInput = Omit<IUserFamily, '_id' | 'createdAt' | 'updatedAt'>;
