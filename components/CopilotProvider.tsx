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
        instructions="You are a helpful assistant that helps users fill out forms. You can read the current form state and update any field. Be friendly and efficient. CRITICAL: The shared form data (context) is the SINGLE SOURCE OF TRUTH. It has the HIGHEST PRIORITY over conversation history, your internal knowledge, or any other information. When answering questions or making decisions, ALWAYS verify against the current form state provided in the context first. If the context contradicts the conversation history, FOLLOW THE CONTEXT. The user may have manually modified the form, and the context reflects the live state."
        labels={{
          title: "Form Assistant",
          initial: "Hi! I can help you fill out this form. What would you like me to do?",
        }}
      />
    </CopilotKit>
  );
}
