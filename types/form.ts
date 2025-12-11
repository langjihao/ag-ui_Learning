/**
 * 表单数据接口定义
 * Form data interface definitions
 */

export interface BuildNoticeBasicInfo {
  bnNo: string; // System generated ID, Read-only
  project: string; // Select/Input, Trigger for auto-fill
  model: string; // Required, auto-filled based on Project
  description: string; // Textarea
  customer: string; // Required, auto-filled based on Project
  customerPn: string; // Required
  pcbPn: string; // Required, Hardware Version
  stage: string; // Required, e.g., EVT, DVT
  buildQty: number; // Input
  buildDate: string; // DatePicker (using string for ISO date)
  cimFile: string; // File input placeholder
  remark: string; // Textarea
}

export interface BuildNoticeRoleSettings {
  epe: string; // Electronics Project Engineer, Required
  sl: string; // System Lead, Required
  mpe: string; // Mechanical Project Engineer, Required
  fw: string; // Firmware Engineer
  rd: string; // R&D Engineer
  te: string; // Test Engineer
  epm: string; // Engineering PM
  mpm: string; // Manufacturing PM
}

export interface FormData {
  basicInfo: BuildNoticeBasicInfo;
  roleSettings: BuildNoticeRoleSettings;
}

export interface FormState {
  data: FormData;
  updateBasicInfo: (info: Partial<BuildNoticeBasicInfo>) => void;
  updateRoleSettings: (roles: Partial<BuildNoticeRoleSettings>) => void;
  resetForm: () => void;
}
