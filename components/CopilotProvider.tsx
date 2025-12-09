'use client';

import { CopilotKit } from '@copilotkit/react-core';
import { CopilotPopup } from '@copilotkit/react-ui';
import '@copilotkit/react-ui/styles.css';

/**
 * CopilotKit Provider 组件
 * CopilotKit Provider Component
 * 
 * 包装应用以提供 AI 助手功能
 * Wraps the application to provide AI assistant capabilities
 */
export function CopilotProvider({ children }: { children: React.ReactNode }) {
  return (
    <CopilotKit runtimeUrl="/api/copilotkit">
      {children}
      <CopilotPopup
        instructions="You are a helpful assistant that helps users fill out forms. You can read the current form state and update any field. Be friendly and efficient."
        labels={{
          title: "Form Assistant",
          initial: "Hi! I can help you fill out this form. What would you like me to do?",
        }}
      />
    </CopilotKit>
  );
}
