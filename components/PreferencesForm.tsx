'use client';

import { useFormStore } from '@/lib/store';
import { useCopilotReadable, useCopilotAction } from '@copilotkit/react-core';
import { z } from 'zod';

/**
 * 偏好设置表单组件
 * Preferences Form Component
 */
export function PreferencesForm() {
  const { data, updatePreferences } = useFormStore();
  const { preferences } = data;

  useCopilotReadable({
    description: 'User Preferences (newsletter, notifications, language, theme)',
    value: preferences,
  });

  useCopilotAction({
    name: 'updatePreferences',
    description: 'Update user preferences (newsletter, notifications, language, theme)',
    parameters: [
      {
        name: 'newsletter',
        description: 'Subscribe to newsletter',
        schema: z.boolean().optional().nullable(),
      },
      {
        name: 'notifications',
        description: 'Enable notifications',
        schema: z.boolean().optional().nullable(),
      },
      {
        name: 'language',
        description: 'Preferred language (en, zh, es, fr)',
        schema: z.string().optional().nullable(),
      },
      {
        name: 'theme',
        description: 'Theme preference (light, dark, system)',
        schema: z.enum(['light', 'dark', 'system']).optional().nullable(),
      },
    ],
    handler: async ({ newsletter, notifications, language, theme }) => {
      updatePreferences({
        ...(typeof newsletter === 'boolean' && { newsletter }),
        ...(typeof notifications === 'boolean' && { notifications }),
        ...(language && { language }),
        ...(theme && { theme: theme as 'light' | 'dark' | 'system' }),
      });
      return `Updated preferences successfully`;
    },
  });

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">Preferences</h2>
      
      <div className="space-y-4">
        <div className="flex items-center">
          <input
            id="newsletter"
            type="checkbox"
            checked={preferences.newsletter}
            onChange={(e) => updatePreferences({ newsletter: e.target.checked })}
            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
          />
          <label htmlFor="newsletter" className="ml-2 text-sm">
            Subscribe to newsletter
          </label>
        </div>

        <div className="flex items-center">
          <input
            id="notifications"
            type="checkbox"
            checked={preferences.notifications}
            onChange={(e) => updatePreferences({ notifications: e.target.checked })}
            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
          />
          <label htmlFor="notifications" className="ml-2 text-sm">
            Enable notifications
          </label>
        </div>

        <div>
          <label htmlFor="language" className="block text-sm font-medium mb-1">
            Preferred Language
          </label>
          <select
            id="language"
            value={preferences.language}
            onChange={(e) => updatePreferences({ language: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600"
          >
            <option value="en">English</option>
            <option value="zh">中文</option>
            <option value="es">Español</option>
            <option value="fr">Français</option>
          </select>
        </div>

        <div>
          <label htmlFor="theme" className="block text-sm font-medium mb-1">
            Theme
          </label>
          <select
            id="theme"
            value={preferences.theme}
            onChange={(e) => updatePreferences({ theme: e.target.value as 'light' | 'dark' | 'system' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600"
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="system">System</option>
          </select>
        </div>
      </div>
    </div>
  );
}
