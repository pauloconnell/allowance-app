export interface IFamily { 
    _id: string; name: string; // e.g., "The Johnson Family" 
    slug: string; // URL-friendly identifier 
    description?: string; // optional notes about the family 
    primaryEmail?: string; // contact email 
    primaryPhone?: string; // contact phone 
    address?: string; 
    city?: string; 
    state?: string; 
    zipCode?: string; 
    country?: string; 
    avatar?: string; // family photo or icon 
    isActive: boolean; 
    createdAt: string; 
    updatedAt: string; 
    } 
    export type IFamilyInput = Omit<IFamily, '_id' | 'createdAt' | 'updatedAt'>;