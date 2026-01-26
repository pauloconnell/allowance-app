export interface IUserCompany {
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

export type IUserCompanyInput = Omit<IUserCompany, '_id' | 'createdAt' | 'updatedAt'>;
