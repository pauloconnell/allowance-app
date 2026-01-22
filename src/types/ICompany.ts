export interface ICompany {
   _id: string;
   name: string;
   slug: string;
   description?: string;
   email?: string;
   phone?: string;
   address?: string;
   city?: string;
   state?: string;
   zipCode?: string;
   country?: string;
   logo?: string;
   isActive: boolean;
   createdAt: string;
   updatedAt: string;
}

export type ICompanyInput = Omit<ICompany, '_id' | 'createdAt' | 'updatedAt'>;
