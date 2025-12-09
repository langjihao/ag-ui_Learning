/**
 * 表单数据接口定义
 * Form data interface definitions
 */

export interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface Preferences {
  newsletter: boolean;
  notifications: boolean;
  language: string;
  theme: 'light' | 'dark' | 'system';
}

export interface FormData {
  personalInfo: PersonalInfo;
  address: Address;
  preferences: Preferences;
  bio: string;
}

export interface FormState {
  data: FormData;
  updatePersonalInfo: (info: Partial<PersonalInfo>) => void;
  updateAddress: (address: Partial<Address>) => void;
  updatePreferences: (prefs: Partial<Preferences>) => void;
  updateBio: (bio: string) => void;
  resetForm: () => void;
}
