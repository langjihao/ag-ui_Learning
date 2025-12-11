'use client';

import { useState } from 'react';
import { useCopilotAction } from '@copilotkit/react-core';
import { useFormStore } from '@/lib/store';
import { BasicInfoForm } from './BasicInfoForm';
import { RoleSettingsForm } from './RoleSettingsForm';

/**
 * 智能表单组件
 * Smart Form Component with CopilotKit Integration
 * 
 * 这个组件集成了 CopilotKit，允许 AI 助手访问和修改表单状态
 * This component integrates with CopilotKit, allowing the AI assistant to access and modify form state
 */
export function SmartForm() {
  const {
    data,
    resetForm,
  } = useFormStore();
  
  const [showJson, setShowJson] = useState(false);

  // 定义 AI 可以执行的操作：重置表单
  // Define AI action: reset form
  useCopilotAction({
    name: 'resetForm',
    description: 'Reset all form fields to their initial empty state',
    parameters: [],
    handler: async () => {
      resetForm();
      return `Form reset successfully`;
    },
  });

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Build Notice Process System</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Create a new Build Notice. You can fill this form manually or ask the AI assistant to help you!
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
          Try asking: &quot;Set project to ProjectX&quot;, &quot;Assign John Doe as EPE&quot;, 
          &quot;Set build quantity to 100&quot;, &quot;Set stage to EVT&quot;
        </p>
      </div>

      <div className="space-y-8 bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6">
        <BasicInfoForm />
        <hr className="border-gray-200 dark:border-gray-700" />
        <RoleSettingsForm />
        
        <div className="flex gap-4 pt-4">
          <button
            onClick={() => setShowJson(!showJson)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {showJson ? 'Hide' : 'Show'} Form Data (JSON)
          </button>
          
          <button
            onClick={resetForm}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            Reset Form
          </button>
        </div>

        {showJson && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">Current Form Data:</h3>
            <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md overflow-auto text-sm">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
