'use client';

import { FormEvent, useState } from 'react';
import { createFamily } from '@/lib/actions/family';
import { sanitizeInput } from '@/lib/utils/sanitizeInput';

export default function SetupFamilyForm() {
  const [familyName, setFamilyName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);

    let sanitizedFamilyName = '';

    try {
      sanitizedFamilyName = sanitizeInput(familyName);
    } catch {
      setError('Replacing invalid characters in family name failed.');
    }

    try {
      const result = await createFamily(sanitizedFamilyName);
      if (result?.error) {
        setError(result.error);
      }
      // Successful case: createFamily() will redirect automatically
    } catch (err) {
      console.error(err);
      setError('Failed to create family. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label
          htmlFor="familyName"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Family Name
        </label>
        <input
          id="familyName"
          type="text"
          value={familyName}
          onChange={(e) => setFamilyName(e.target.value)}
          placeholder="Enter your family name"
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
          disabled={loading}
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !familyName.trim()}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-md transition-colors"
      >
        {loading ? 'Creating...' : 'Create Family'}
      </button>
    </form>
  );
}
