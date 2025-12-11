import { create } from 'zustand';
import type { FormState, FormData } from '@/types/form';

/**
 * 初始表单数据
 * Initial form data
 */
const initialFormData: FormData = {
  basicInfo: {
    bnNo: 'BN-' + Date.now(), // Simple auto-generation for demo
    project: '',
    model: '',
    description: '',
    customer: '',
    customerPn: '',
    pcbPn: '',
    stage: '',
    buildQty: 0,
    buildDate: new Date().toISOString().split('T')[0],
    cimFile: '',
    remark: '',
  },
  roleSettings: {
    epe: '',
    sl: '',
    mpe: '',
    fw: '',
    rd: '',
    te: '',
    epm: '',
    mpm: '',
  },
};

/**
 * 表单状态管理 Store
 * Form state management store using Zustand
 * 
 * 这个 store 被 UI 组件和 AI Agent 共享使用
 * This store is shared between UI components and AI Agent
 */
export const useFormStore = create<FormState>((set) => ({
  data: initialFormData,
  
  updateBasicInfo: (info) =>
    set((state) => ({
      data: {
        ...state.data,
        basicInfo: {
          ...state.data.basicInfo,
          ...info,
        },
      },
    })),
  
  updateRoleSettings: (roles) =>
    set((state) => ({
      data: {
        ...state.data,
        roleSettings: {
          ...state.data.roleSettings,
          ...roles,
        },
      },
    })),
  
  resetForm: () => set({ data: initialFormData }),
}));
