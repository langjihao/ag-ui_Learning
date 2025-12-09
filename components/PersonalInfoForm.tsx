'use client';

import { useFormStore } from '@/lib/store';
import { useCopilotReadable, useCopilotAction } from '@copilotkit/react-core';
import { z } from 'zod';

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
    description: 'Update personal information fields (firstName, lastName, email, phone, dateOfBirth)',
    parameters: [
      {
        name: 'firstName',
        description: 'First name',
        schema: z.string().optional().nullable(),
      },
      {
        name: 'lastName',
        description: 'Last name',
        schema: z.string().optional().nullable(),
      },
      {
        name: 'email',
        description: 'Email address',
        schema: z.string().optional().nullable(),
      },
      {
        name: 'phone',
        description: 'Phone number',
        schema: z.string().optional().nullable(),
      },
      {
        name: 'dateOfBirth',
        description: 'Date of birth (YYYY-MM-DD)',
        schema: z.string().optional().nullable(),
      },
    ],
    handler: async ({ firstName, lastName, email, phone, dateOfBirth }) => {
      // Ensure dateOfBirth is in YYYY-MM-DD format if provided
      let formattedDateOfBirth = dateOfBirth;
      if (dateOfBirth) {
        const date = new Date(dateOfBirth);
        if (!isNaN(date.getTime())) {
          formattedDateOfBirth = date.toISOString().split('T')[0];
        }
      }

      updatePersonalInfo({
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(email && { email }),
        ...(phone && { phone }),
        ...(formattedDateOfBirth && { dateOfBirth: formattedDateOfBirth }),
      });
      return `Updated personal info successfully`;
    },
  });

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium mb-1">
            First Name *
          </label>
          <input
            id="firstName"
            type="text"
            value={personalInfo.firstName}
            onChange={(e) => updatePersonalInfo({ firstName: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600"
            placeholder="John"
          />
        </div>

        <div>
          <label htmlFor="lastName" className="block text-sm font-medium mb-1">
            Last Name *
          </label>
          <input
            id="lastName"
            type="text"
            value={personalInfo.lastName}
            onChange={(e) => updatePersonalInfo({ lastName: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600"
            placeholder="Doe"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">
            Email *
          </label>
          <input
            id="email"
            type="email"
            value={personalInfo.email}
            onChange={(e) => updatePersonalInfo({ email: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600"
            placeholder="john.doe@example.com"
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium mb-1">
            Phone Number
          </label>
          <input
            id="phone"
            type="tel"
            value={personalInfo.phone}
            onChange={(e) => updatePersonalInfo({ phone: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600"
            placeholder="+1 (555) 123-4567"
          />
        </div>

        <div>
          <label htmlFor="dateOfBirth" className="block text-sm font-medium mb-1">
            Date of Birth
          </label>
          <input
            id="dateOfBirth"
            type="date"
            value={personalInfo.dateOfBirth}
            onChange={(e) => updatePersonalInfo({ dateOfBirth: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600"
          />
        </div>
      </div>
    </div>
  );
}
