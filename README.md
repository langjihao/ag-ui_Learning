# ag-ui_Learning

## 智能表单填写助手 Demo / Smart Form Assistant Demo

这是一个用于学习 ag-ui 和 CopilotKit 的演示项目，展示了如何实现 UI 组件与 AI Agent 共享状态的智能表单填写助手。

This is a demo project for learning ag-ui and CopilotKit, showcasing how to implement a smart form-filling assistant with shared state between UI components and AI Agent.

### 演示截图 / Screenshots

![Smart Form Assistant](https://github.com/user-attachments/assets/9f3eff58-1c14-4a1d-b7fd-3bbf75981685)
*智能表单界面 / Smart Form Interface*

![Form with Data and JSON State](https://github.com/user-attachments/assets/8334c27f-c22c-45c8-9d70-1b98ca9aa024)
*表单数据和 JSON 状态视图 / Form Data and JSON State View*

### 功能特性 / Features

- ✅ **TypeScript 规范开发** - 完整的类型定义和类型安全
- ✅ **共享状态管理** - 使用 Zustand 实现 UI 和 AI Agent 的状态共享
- ✅ **智能表单助手** - 通过 CopilotKit 集成 AI 助手
- ✅ **响应式设计** - 使用 Tailwind CSS 实现现代化 UI
- ✅ **模块化组件** - 清晰的组件结构和代码组织

### 技术栈 / Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **State Management**: Zustand
- **AI Integration**: CopilotKit
- **Styling**: Tailwind CSS
- **Grid**: ag-Grid (for future data display)

### 项目结构 / Project Structure

```
ag-ui_Learning/
├── app/
│   ├── api/
│   │   └── copilotkit/       # CopilotKit API 路由
│   ├── layout.tsx             # 根布局
│   ├── page.tsx               # 主页面
│   └── globals.css            # 全局样式
├── components/
│   ├── SmartForm.tsx          # 智能表单主组件（集成 CopilotKit）
│   ├── PersonalInfoForm.tsx   # 个人信息表单
│   ├── AddressForm.tsx        # 地址表单
│   ├── PreferencesForm.tsx    # 偏好设置表单
│   ├── BioForm.tsx            # 简介表单
│   └── CopilotProvider.tsx    # CopilotKit Provider
├── lib/
│   └── store.ts               # Zustand 状态管理
├── types/
│   └── form.ts                # TypeScript 类型定义
└── package.json
```

### 快速开始 / Quick Start

1. **安装依赖 / Install dependencies**

```bash
npm install
```

2. **运行开发服务器 / Run development server**

```bash
npm run dev
```

3. **打开浏览器 / Open browser**

访问 [http://localhost:3000](http://localhost:3000)

### AI 集成配置（可选）/ AI Integration Setup (Optional)

当前项目使用的是 CopilotKit 的基础配置。要启用完整的 AI 功能，你需要：

Currently, the project uses CopilotKit's basic configuration. To enable full AI capabilities, you need to:

1. **复制环境变量模板 / Copy environment template**

```bash
cp .env.example .env
```

2. **配置 AI 服务 / Configure AI service**

在 `.env` 文件中填入你的 API 密钥（如使用 OpenAI）：

Fill in your API keys in the `.env` file (e.g., for OpenAI):

```
OPENAI_API_KEY=your_openai_api_key_here
```

3. **更新 API 路由 / Update API route**

修改 `app/api/copilotkit/route.ts` 以集成真实的 AI 服务。参考 [CopilotKit 文档](https://docs.copilotkit.ai/)。

Modify `app/api/copilotkit/route.ts` to integrate with a real AI service. Refer to [CopilotKit Documentation](https://docs.copilotkit.ai/).

> **注意 / Note**: 即使没有配置 AI 后端，你仍然可以看到完整的 UI 和状态管理系统的工作方式。所有的 AI Actions 已经定义好，只需要连接真实的 AI 服务即可使用。
>
> Even without configuring an AI backend, you can still see how the complete UI and state management system works. All AI Actions are already defined and just need to be connected to a real AI service.

### 使用说明 / Usage

#### 手动填写表单 / Manual Form Filling

直接在表单字段中输入信息。

#### 使用 AI 助手 / Using AI Assistant

点击右下角的 AI 助手图标，然后可以通过自然语言与 AI 交互，例如：

- "填写我的名字为张三"
- "设置我的邮箱为 zhangsan@example.com"
- "我住在北京市朝阳区"
- "开启新闻订阅"
- "将主题设置为深色模式"

### 核心概念 / Core Concepts

#### 1. 共享状态管理 / Shared State Management

使用 Zustand 创建全局状态 store，UI 组件和 AI Agent 都可以访问和修改：

```typescript
// lib/store.ts
export const useFormStore = create<FormState>((set) => ({
  data: initialFormData,
  updatePersonalInfo: (info) => { /* ... */ },
  // ...
}));
```

#### 2. CopilotKit 集成 / CopilotKit Integration

通过 `useCopilotReadable` 让 AI 读取状态：

```typescript
useCopilotReadable({
  description: 'The current form data',
  value: data,
});
```

通过 `useCopilotAction` 定义 AI 可执行的操作：

```typescript
useCopilotAction({
  name: 'updatePersonalInfo',
  description: 'Update personal information',
  parameters: [/* ... */],
  handler: async ({ firstName, lastName }) => {
    updatePersonalInfo({ firstName, lastName });
  },
});
```

#### 3. TypeScript 类型安全 / TypeScript Type Safety

所有的数据结构都有明确的类型定义：

```typescript
// types/form.ts
export interface FormData {
  personalInfo: PersonalInfo;
  address: Address;
  preferences: Preferences;
  bio: string;
}
```

### 开发指南 / Development Guide

#### 添加新的表单字段 / Adding New Form Fields

1. 在 `types/form.ts` 中添加类型定义
2. 在 `lib/store.ts` 中更新 store
3. 创建或更新相应的表单组件
4. 在 `SmartForm.tsx` 中添加对应的 AI action

#### 自定义 AI 行为 / Customizing AI Behavior

修改 `CopilotProvider.tsx` 中的 `instructions` 属性来改变 AI 助手的行为。

### 构建生产版本 / Build for Production

```bash
npm run build
npm start
```

### 代码规范 / Code Standards

- 使用 ESLint 进行代码检查
- 遵循 TypeScript 严格模式
- 组件使用函数式组件和 Hooks
- 使用 JSDoc 注释提供中英文说明

### 高级架构扩展 / Advanced Architecture Extension

本项目目前展示了前端与 AI 的交互。若要实现更复杂的后端能力（如数据库查询、RAG/知识库检索、MCP 操作），可以通过扩展 `app/api/copilotkit/route.ts` 中的 `CopilotRuntime` 来实现。

The project currently demonstrates frontend-AI interaction. To implement more complex backend capabilities (such as database queries, RAG/Knowledge Base retrieval, MCP operations), you can extend the `CopilotRuntime` in `app/api/copilotkit/route.ts`.

#### 架构图 / Architecture Diagram

```mermaid
graph TD
    User[User / Frontend] <-->|useCopilotAction| CopilotKit[CopilotKit Runtime]
    CopilotKit <-->|LangChain Adapter| LLM[LLM (OpenAI/Anthropic)]
    
    subgraph Backend Actions [Backend Capabilities]
        CopilotKit -->|Action: fetchServerLogs| DB[(Database)]
        CopilotKit -->|Action: searchKnowledgeBase| VectorDB[(Vector DB / RAG)]
        CopilotKit -->|Action: mcpTool| MCPServer[MCP Server]
    end
```

#### 实现示例 / Implementation Example

在 `app/api/copilotkit/route.ts` 中配置 `actions`：

Configure `actions` in `app/api/copilotkit/route.ts`:

```typescript
// app/api/copilotkit/route.ts
import { CopilotRuntime } from "@copilotkit/runtime";

// ...

const runtime = new CopilotRuntime({
  actions: [
    // 1. 数据库查询示例 / Database Query Example
    {
      name: "fetchUserOrders",
      description: "Fetch order history for the current user from the database",
      parameters: [
        { name: "limit", type: "number", description: "Max number of orders to fetch" }
      ],
      handler: async ({ limit }) => {
        // const orders = await db.query("SELECT * FROM orders LIMIT ?", [limit]);
        return JSON.stringify({ orders: [] }); // Mock response
      }
    },
    
    // 2. 知识库检索 (RAG) 示例 / Knowledge Base (RAG) Example
    {
      name: "searchPolicy",
      description: "Search company policies in the knowledge base",
      parameters: [
        { name: "query", type: "string", description: "Search query" }
      ],
      handler: async ({ query }) => {
        // const docs = await vectorStore.similaritySearch(query);
        return "Policy: All forms must be filled in English."; // Mock response
      }
    },
    
    // 3. MCP 工具集成示例 / MCP Tool Integration Example
    {
      name: "checkServerStatus",
      description: "Check the status of a remote server via MCP",
      parameters: [
        { name: "serverId", type: "string" }
      ],
      handler: async ({ serverId }) => {
        // Call your MCP client here
        return `Server ${serverId} is ONLINE`;
      }
    }
  ]
});
```

通过这种方式，你可以将任何后端逻辑封装为 AI 可调用的工具，从而极大地扩展 Agent 的能力边界。

By doing this, you can encapsulate any backend logic as tools callable by the AI, thereby greatly expanding the capabilities of the Agent.

### 许可证 / License

MIT

### 贡献 / Contributing

欢迎提交 Issue 和 Pull Request！

### 联系方式 / Contact

如有问题，请提交 Issue。