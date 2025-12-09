'use client';

import { useFormStore } from '@/lib/store';
import { useCopilotReadable, useCopilotAction } from '@copilotkit/react-core';
import { z } from 'zod';

// 提取通用的 Input 组件，减少重复代码
const FormInput = ({ 
  id, 
  label, 
  value, 
  onChange, 
  type = "text", 
  placeholder, 
  required = false 
}: {
  id: string;
  label: string;
  value: string;
  onChange: (val: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium mb-1">
      {label} {required && '*'}
    </label>
    <input
      id={id}
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600"
      placeholder={placeholder}
    />
  </div>
);

/**
 * 个人信息表单组件
 * Personal Information Form Component
 */
export function PersonalInfoForm() {
  const { data, updatePersonalInfo } = useFormStore();
  const { personalInfo } = data;

  useCopilotReadable({
    description: 'Personal Information (firstName, lastName, email, phone, dateOfBirth)',
    value: personalInfo,
  });

  useCopilotAction({
    name: 'updatePersonalInfo',
    description: 'Update personal information fields. Only provide fields that need to be changed.',
    parameters: [
      { name: 'firstName', description: 'First name', schema: z.string().optional() },
      { name: 'lastName', description: 'Last name', schema: z.string().optional() },
      { name: 'email', description: 'Email address', schema: z.string().optional() },
      { name: 'phone', description: 'Phone number', schema: z.string().optional() },
      { name: 'dateOfBirth', description: 'Date of birth (YYYY-MM-DD)', schema: z.string().optional() },
    ],
    handler: async (args) => {
      // 1. 动态构建更新对象，过滤掉 undefined/null
      const updates = Object.entries(args).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null) {
          // 特殊处理日期
          if (key === 'dateOfBirth') {
            const date = new Date(value as string);
            if (!isNaN(date.getTime())) {
              acc[key] = date.toISOString().split('T')[0];
            }
          } else {
            acc[key] = value;
          }
        }
        return acc;
      }, {} as Record<string, any>);

      // 2. 只有当有有效更新时才调用 store
      if (Object.keys(updates).length > 0) {
        updatePersonalInfo(updates);
        return `Updated: ${Object.keys(updates).join(', ')}`;
      }
      return "No changes made.";
    },
  });

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          id="firstName"
          label="First Name"
          value={personalInfo.firstName}
          onChange={(val) => updatePersonalInfo({ firstName: val })}
          placeholder="John"
          required
        />
        <FormInput
          id="lastName"
          label="Last Name"
          value={personalInfo.lastName}
          onChange={(val) => updatePersonalInfo({ lastName: val })}
          placeholder="Doe"
          required
        />
        <FormInput
          id="email"
          label="Email"
          type="email"
          value={personalInfo.email}
          onChange={(val) => updatePersonalInfo({ email: val })}
          placeholder="john.doe@example.com"
          required
        />
        <FormInput
          id="phone"
          label="Phone Number"
          type="tel"
          value={personalInfo.phone}
          onChange={(val) => updatePersonalInfo({ phone: val })}
          placeholder="+1 (555) 123-4567"
        />
        <FormInput
          id="dateOfBirth"
          label="Date of Birth"
          type="date"
          value={personalInfo.dateOfBirth}
          onChange={(val) => updatePersonalInfo({ dateOfBirth: val })}
        />
      </div>
    </div>
  );
}
