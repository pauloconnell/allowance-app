'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { sanitizeInput } from '@/lib/utils/sanitizeInput';
import type { IChild } from '@/types/IChild';
import type { IFormChild } from '@/types/IFormChild';

interface ChildFormProps {
   child?: IChild | IFormChild;
   familyId: string;
}

export default function ChildForm({ child, familyId }: ChildFormProps) {
   const router = useRouter();
   const isEdit = !!child;

   // Handle ID for edit mode
   const derivedChildId =
      child && '_id' in child ? child._id : (child?.childId ?? '');

   const [form, setForm] = useState({
      name: child?.name ?? '',
      age: child?.age ?? '',
      avatarUrl: child?.avatarUrl ?? '',
      childId: derivedChildId,
      familyId: familyId ?? '',
   });

   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const cleaned = sanitizeInput(e.target.value);
      setForm({ ...form, [e.target.name]: cleaned });
   };

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      if (isEdit && child) {
         const savedChild = child as IChild;

         // UPDATE existing child
         const res = await fetch(`/api/children/${savedChild._id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...form, familyId }),
         });

         if (!res.ok) throw new Error('Failed to update child');
         toast.success('Child updated');

         router.push(`/protectedPages/${familyId}/children`);
         router.refresh();
      } else {
         // CREATE new child
         const res = await fetch('/api/children', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...form, familyId }),
         });

         if (!res.ok) throw new Error('Failed to create child');
         toast.success('Child added');

         router.push(`/protectedPages/${familyId}/children`);
         router.refresh();
      }
   };

   return (
      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-md">
         <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
               Name
            </label>
            <input
               id="name"
               name="name"
               value={form.name}
               onChange={handleChange}
               placeholder="Child's name"
               className="w-full px-3 py-2 border border-gray-300 rounded-md"
               required
            />
         </div>

         <div>
            <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">
               Age
            </label>
            <input
               id="age"
               name="age"
               type="number"
               min="1"
               max="18"
               value={form.age}
               onChange={handleChange}
               placeholder="Age"
               className="w-full px-3 py-2 border border-gray-300 rounded-md"
               required
            />
         </div>

         <div>
            <label htmlFor="avatarUrl" className="block text-sm font-medium text-gray-700 mb-1">
               Avatar URL (optional)
            </label>
            <input
               id="avatarUrl"
               name="avatarUrl"
               type="url"
               value={form.avatarUrl}
               onChange={handleChange}
               placeholder="https://example.com/avatar.png"
               className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
         </div>

         <div className="flex justify-between items-center mt-6">
            <button className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700">
               {isEdit ? 'Save Changes' : 'Add Child'}
            </button>

            <button
               type="button"
               onClick={() => router.back()}
               className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
            >
               Cancel
            </button>
         </div>

         <div>
            {/* Remove after dev */}
            <pre className="text-xs bg-gray-100 p-2 rounded">{JSON.stringify(form, null, 2)}</pre>
         </div>
      </form>
   );
}
