'use client';

import { useFormStore } from '@/lib/store';
import { useCopilotReadable, useCopilotAction } from '@copilotkit/react-core';
import { z } from 'zod';

const FormInput = ({ 
  id, 
  label, 
  value, 
  onChange, 
  type = "text", 
  placeholder, 
  required = false,
  readOnly = false
}: {
  id: string;
  label: string;
  value: string | number;
  onChange: (val: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  readOnly?: boolean;
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
      readOnly={readOnly}
      className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 ${readOnly ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed' : ''}`}
      placeholder={placeholder}
    />
  </div>
);

const FormTextarea = ({ 
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
    <textarea
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600"
      placeholder={placeholder}
      rows={3}
    />
  </div>
);

export function BasicInfoForm() {
  const { data, updateBasicInfo } = useFormStore();
  const { basicInfo } = data;

  useCopilotReadable({
    description: 'Build Notice Basic Information',
    value: basicInfo,
  });

  useCopilotAction({
    name: 'updateBasicInfo',
    description: 'Update basic information fields for the Build Notice.',
    parameters: [
      { name: 'project', description: 'Project name', schema: z.string().optional() },
      { name: 'model', description: 'Model name', schema: z.string().optional() },
      { name: 'description', description: 'Description', schema: z.string().optional() },
      { name: 'customer', description: 'Customer name', schema: z.string().optional() },
      { name: 'customerPn', description: 'Customer Part Number', schema: z.string().optional() },
      { name: 'pcbPn', description: 'PCB Part Number / Hardware Version', schema: z.string().optional() },
      { name: 'stage', description: 'Build Stage (e.g., EVT, DVT)', schema: z.string().optional() },
      { name: 'buildQty', description: 'Build Quantity', schema: z.number().optional() },
      { name: 'buildDate', description: 'Build Date (YYYY-MM-DD)', schema: z.string().optional() },
      { name: 'cimFile', description: 'CIM File path/name', schema: z.string().optional() },
      { name: 'remark', description: 'Remarks', schema: z.string().optional() },
    ],
    handler: async (args) => {
      const updates = Object.entries(args).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null) {
          acc[key] = value;
        }
        return acc;
      }, {} as Record<string, any>);

      if (Object.keys(updates).length > 0) {
        updateBasicInfo(updates);
        return `Updated Basic Info: ${Object.keys(updates).join(', ')}`;
      }
      return "No changes made.";
    },
  });

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">Section A: Basic Information</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          id="bnNo"
          label="BN No."
          value={basicInfo.bnNo}
          onChange={() => {}}
          readOnly
        />
        <FormInput
          id="project"
          label="Project"
          value={basicInfo.project}
          onChange={(val) => updateBasicInfo({ project: val })}
          placeholder="Select or enter project"
        />
        <FormInput
          id="model"
          label="Model"
          value={basicInfo.model}
          onChange={(val) => updateBasicInfo({ model: val })}
          required
        />
        <FormInput
          id="customer"
          label="Customer"
          value={basicInfo.customer}
          onChange={(val) => updateBasicInfo({ customer: val })}
          required
        />
        <FormInput
          id="customerPn"
          label="Customer P/N"
          value={basicInfo.customerPn}
          onChange={(val) => updateBasicInfo({ customerPn: val })}
          required
        />
        <FormInput
          id="pcbPn"
          label="PCB P/N (HW Version)"
          value={basicInfo.pcbPn}
          onChange={(val) => updateBasicInfo({ pcbPn: val })}
          required
        />
        <FormInput
          id="stage"
          label="Stage"
          value={basicInfo.stage}
          onChange={(val) => updateBasicInfo({ stage: val })}
          placeholder="EVT, DVT, PVT..."
          required
        />
        <FormInput
          id="buildQty"
          label="Build Qty"
          type="number"
          value={basicInfo.buildQty}
          onChange={(val) => updateBasicInfo({ buildQty: parseInt(val) || 0 })}
        />
        <FormInput
          id="buildDate"
          label="Build Date"
          type="date"
          value={basicInfo.buildDate}
          onChange={(val) => updateBasicInfo({ buildDate: val })}
        />
        <FormInput
          id="cimFile"
          label="CIM File"
          type="file" // Just a placeholder for now, value binding might be tricky with file input directly
          value={""} // File inputs are uncontrolled usually, or we just show the name if we had it
          onChange={(val) => updateBasicInfo({ cimFile: val })} 
          placeholder="Upload CIM File"
        />
      </div>
      
      <FormTextarea
        id="description"
        label="Description"
        value={basicInfo.description}
        onChange={(val) => updateBasicInfo({ description: val })}
      />
      
      <FormTextarea
        id="remark"
        label="Remark"
        value={basicInfo.remark}
        onChange={(val) => updateBasicInfo({ remark: val })}
      />
    </div>
  );
}
