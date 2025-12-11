'use client';

import { useFormStore } from '@/lib/store';
import { useCopilotReadable, useCopilotAction } from '@copilotkit/react-core';
import { z } from 'zod';

const FormInput = ({ 
  id, 
  label, 
  value, 
  onChange, 
  placeholder, 
  required = false 
}: {
  id: string;
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  required?: boolean;
}) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium mb-1">
      {label} {required && '*'}
    </label>
    <input
      id={id}
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600"
      placeholder={placeholder}
    />
  </div>
);

export function RoleSettingsForm() {
  const { data, updateRoleSettings } = useFormStore();
  const { roleSettings } = data;

  useCopilotReadable({
    description: 'Build Notice Role Settings',
    value: roleSettings,
  });

  useCopilotAction({
    name: 'updateRoleSettings',
    description: 'Update role settings for the Build Notice.',
    parameters: [
      { name: 'epe', description: 'Electronics Project Engineer', schema: z.string().optional() },
      { name: 'sl', description: 'System Lead', schema: z.string().optional() },
      { name: 'mpe', description: 'Mechanical Project Engineer', schema: z.string().optional() },
      { name: 'fw', description: 'Firmware Engineer', schema: z.string().optional() },
      { name: 'rd', description: 'R&D Engineer', schema: z.string().optional() },
      { name: 'te', description: 'Test Engineer', schema: z.string().optional() },
      { name: 'epm', description: 'Engineering PM', schema: z.string().optional() },
      { name: 'mpm', description: 'Manufacturing PM', schema: z.string().optional() },
    ],
    handler: async (args) => {
      const updates = Object.entries(args).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null) {
          acc[key] = value;
        }
        return acc;
      }, {} as Record<string, any>);

      if (Object.keys(updates).length > 0) {
        updateRoleSettings(updates);
        return `Updated Role Settings: ${Object.keys(updates).join(', ')}`;
      }
      return "No changes made.";
    },
  });

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">Section B: Role Settings</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          id="epe"
          label="EPE (Electronics Project Engineer)"
          value={roleSettings.epe}
          onChange={(val) => updateRoleSettings({ epe: val })}
          required
        />
        <FormInput
          id="sl"
          label="SL (System Lead)"
          value={roleSettings.sl}
          onChange={(val) => updateRoleSettings({ sl: val })}
          required
        />
        <FormInput
          id="mpe"
          label="MPE (Mechanical Project Engineer)"
          value={roleSettings.mpe}
          onChange={(val) => updateRoleSettings({ mpe: val })}
          required
        />
        <FormInput
          id="fw"
          label="FW (Firmware Engineer)"
          value={roleSettings.fw}
          onChange={(val) => updateRoleSettings({ fw: val })}
        />
        <FormInput
          id="rd"
          label="RD (R&D Engineer)"
          value={roleSettings.rd}
          onChange={(val) => updateRoleSettings({ rd: val })}
        />
        <FormInput
          id="te"
          label="TE (Test Engineer)"
          value={roleSettings.te}
          onChange={(val) => updateRoleSettings({ te: val })}
        />
        <FormInput
          id="epm"
          label="EPM (Engineering PM)"
          value={roleSettings.epm}
          onChange={(val) => updateRoleSettings({ epm: val })}
        />
        <FormInput
          id="mpm"
          label="MPM (Manufacturing PM)"
          value={roleSettings.mpm}
          onChange={(val) => updateRoleSettings({ mpm: val })}
        />
      </div>
    </div>
  );
}
