import { SmartForm } from '@/components/SmartForm';
import { CopilotProvider } from '@/components/CopilotProvider';

/**
 * 主页面组件
 * Main Page Component
 * 
 * 展示智能表单助手 Demo
 * Displays the Smart Form Assistant Demo
 */
export default function Home() {
  return (
    <CopilotProvider>
      <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8">
        <SmartForm />
      </main>
    </CopilotProvider>
  );
}
