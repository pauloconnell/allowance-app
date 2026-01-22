export interface IInvite {
   _id: string;
   companyId: string;
   email: string;
   role: 'admin' | 'manager' | 'user';
   token: string;
   invitedBy: string;
   status: 'pending' | 'accepted' | 'expired';
   expiresAt: string;
   acceptedAt?: string | null;
   createdAt: string;
   updatedAt: string;
}

export type IInviteInput = Omit<IInvite, '_id' | 'createdAt' | 'updatedAt' | 'token'>;
