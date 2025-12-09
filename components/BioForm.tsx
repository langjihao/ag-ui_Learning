'use client';

import { useFormStore } from '@/lib/store';
import { useCopilotReadable, useCopilotAction } from '@copilotkit/react-core';
import { z } from 'zod';

/**
 * 简介表单组件
 * Bio Form Component
 */
export function BioForm() {
  const { data, updateBio } = useFormStore();

  useCopilotReadable({
    description: 'User Biography',
    value: data.bio,
  });

  useCopilotAction({
    name: 'updateBio',
    description: 'Update the user biography text',
    parameters: [
      {
        name: 'bio',
        description: 'Biography text',
        schema: z.string(),
      },
    ],
    handler: async ({ bio }) => {
      updateBio(bio);
      return `Updated bio successfully`;
    },
  });

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">About You</h2>
      
      <div>
        <label htmlFor="bio" className="block text-sm font-medium mb-1">
          Biography
        </label>
        <textarea
          id="bio"
          value={data.bio}
          onChange={(e) => updateBio(e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600"
          placeholder="Tell us about yourself..."
        />
      </div>
    </div>
  );
}
