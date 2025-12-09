import { create } from 'zustand';
import type { FormState, FormData } from '@/types/form';

/**
 * 初始表单数据
 * Initial form data
 */
const initialFormData: FormData = {
  personalInfo: {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
  },
  address: {
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
  },
  preferences: {
    newsletter: false,
    notifications: true,
    language: 'en',
    theme: 'system',
  },
  bio: '',
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
  
  updatePersonalInfo: (info) =>
    set((state) => ({
      data: {
        ...state.data,
        personalInfo: {
          ...state.data.personalInfo,
          ...info,
        },
      },
    })),
  
  updateAddress: (address) =>
    set((state) => ({
      data: {
        ...state.data,
        address: {
          ...state.data.address,
          ...address,
        },
      },
    })),
  
  updatePreferences: (prefs) =>
    set((state) => ({
      data: {
        ...state.data,
        preferences: {
          ...state.data.preferences,
          ...prefs,
        },
      },
    })),
  
  updateBio: (bio) =>
    set((state) => ({
      data: {
        ...state.data,
        bio,
      },
    })),
  
  resetForm: () => set({ data: initialFormData }),
}));
