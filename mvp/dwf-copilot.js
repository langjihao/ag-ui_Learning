// --- 配置 ---
import { DwfCore } from './js/dwf-core.js';
import { DwfUI } from './js/dwf-ui.js';

const WEBHOOK_URL = (() => {
    // 适配 Codespaces 环境：如果通过 Web 预览访问，需要使用动态生成的域名
    if (typeof window !== 'undefined' && window.location.hostname.includes('github.dev')) {
        // 假设前端运行在 8080 端口，后端在 8001 端口
        // 将 hostname 中的 -8080 替换为 -8001
        const newHost = window.location.hostname.replace(/-8080\./, '-8001.');
        return `${window.location.protocol}//${newHost}/webhook/agent/message`;
    }
    // 默认本地环境 (或 VS Code 本地端口转发)
    return 'http://localhost:8001/webhook/agent/message';
})();

/**
 * DwfCopilot (Facade)
 * 组合 DwfCore 和 DwfUI，保持对外接口一致
 */
export class DwfCopilot {
    constructor(config) {
        // 1. 初始化核心逻辑
        this.core = new DwfCore({
            webhookUrl: config.webhookUrl || WEBHOOK_URL,
            getState: config.getState
        });

        // 2. 初始化 UI
        this.ui = new DwfUI(config.dom);

        // 3. 绑定 UI 事件
        this.ui.bindEvents(() => this.sendMessage());

        // 4. 初始化回调
        if (config.onInit) {
            config.onInit(this);
        }
    }

    /**
     * 注册工具 (委托给 Core)
     */
    registerTool(definition, handler) {
        this.core.registerTool(definition, handler);
    }

    /**
     * 发送消息
     */
    async sendMessage(extraPayload = null) {
        const userText = this.ui.getUserInput();

        // 检查是否需要发送
        if (this.core.isProcessing || (!extraPayload && !userText)) return;

        // UI: 显示用户消息
        if (!extraPayload) {
            this.ui.clearUserInput();
            const { bubble } = this.ui.createMessageBubble('user', Date.now(), false);
            bubble.textContent = userText;
            this.ui.scrollToBottom();
        }

        // UI: 准备 AI 消息气泡
        this.ui.setProcessingState(true);
        const aiMsgId = 'ai-' + Date.now();
        const { bubble: aiBubble } = this.ui.createMessageBubble('assistant', aiMsgId, true);
        
        // UI: 创建内容容器
        const contentEl = document.createElement('div');
        contentEl.className = 'markdown-content';
        aiBubble.appendChild(contentEl);
        
        let thinkingEl = null;

        // 调用 Core 发送消息
        await this.core.sendMessage({
            userText,
            extraPayload,
            onStart: () => {
                // 可以在这里做一些开始时的 UI 更新
            },
            onChunk: (chunk) => {
                if (chunk.type === 'thinking_start') {
                    if (!thinkingEl) thinkingEl = this.ui.createThinkingUI(aiBubble);
                    thinkingEl.open = true;
                } else if (chunk.type === 'thinking') {
                    this.ui.updateThinkingContent(thinkingEl, chunk.full);
                } else if (chunk.type === 'content') {
                    this.ui.updateMarkdownContent(contentEl, chunk.full);
                }
            },
            onError: (err) => {
                this.ui.appendError(contentEl, `❌ ERROR: ${err.message}`);
            },
            onEnd: (fullContent) => {
                this.finalizeMessage(aiBubble, fullContent);
                this.ui.setProcessingState(false);
            }
        });
    }

    /**
     * 消息结束处理 (逻辑 + UI)
     */
    async finalizeMessage(bubbleElement, mainText) {
        bubbleElement.classList.remove('typing-cursor');
        
        const data = this.core.parseJsonPayload(mainText);
        const thinkingEl = bubbleElement.querySelector('.thinking-details');

        // 如果没有工具调用，且气泡为空，则渲染 Markdown
        if (!data) {
            if (bubbleElement.children.length === 0 || (bubbleElement.children.length === 1 && thinkingEl)) {
                 let contentEl = bubbleElement.querySelector('.markdown-content');
                 if(!contentEl) {
                     contentEl = document.createElement('div');
                     contentEl.className = 'markdown-content';
                     bubbleElement.appendChild(contentEl);
                 }
                 this.ui.updateMarkdownContent(contentEl, mainText);
            }
            return; 
        }

        // 清理 JSON 文本
        let cleanedText = mainText;
        const codeBlockMatch = mainText.match(/```json\s*([\s\S]*?)\s*```/);
        if (codeBlockMatch) {
            cleanedText = mainText.replace(codeBlockMatch[0], '');
        } else {
            const inlineMatch = mainText.match(/(\{[\s\S]*\})/);
            if (inlineMatch) {
                cleanedText = mainText.replace(inlineMatch[0], '');
            }
        }

        // 重建气泡内容
        bubbleElement.innerHTML = '';
        if(thinkingEl) bubbleElement.appendChild(thinkingEl);
        
        // 1. 显示数据 Payload
        const argsHtml = `
            <div class="tool-data-display">
                <div class="tool-label">📋 Data Payload (${data.action})</div>
                ${this.ui.formatToolArgs(data.data)}
            </div>`;
        bubbleElement.insertAdjacentHTML('beforeend', argsHtml);
        
        // 2. 显示聊天消息
        const messageHtml = `<div class="markdown-content">${this.ui.renderMarkdown(cleanedText)}</div>`;
        bubbleElement.insertAdjacentHTML('beforeend', messageHtml);

        console.log("Parsed tool data:", JSON.stringify(data, null, 2));

        // 处理工具调用
        const handleHitl = (isClientSide) => {
            const hitlRequest = this.core.buildHitlRequest(data, isClientSide);
            this.ui.createHitlButtons(hitlRequest, bubbleElement, 
                // Confirm Callback
                async () => {
                    if (isClientSide) {
                        // 本地工具执行
                        const result = this.core.executeTool(hitlRequest.action, hitlRequest.data, this);
                        this.ui.appendExecutedResult(bubbleElement, hitlRequest.action, result);
                    } else {
                        // 服务端 HITL 确认
                        this.sendMessage({ response: 'confirmed', action: hitlRequest.action, data: hitlRequest.data });
                    }
                },
                // Cancel Callback
                () => {
                    this.ui.createSystemMessage("❌ 操作已取消");
                    // 可选: 通知服务端取消
                }
            );
        };

        // 情况 1: 本地 HITL 工具
        if (data.action && this.core.tools.hitltools[data.action]) {
            handleHitl(true);
            return;
        } 
        
        // 情况 2: 服务端 HITL 请求
        if (data.ui_request === 'confirm' && data.hitl_action) {
            handleHitl(false);
            return;
        }

        // 情况 3: 自动执行工具
        if (data.action && data.ui_request !== 'confirm') {
            const resultText = this.core.executeTool(data.action, data.data || {}, this);
            this.ui.appendToolResult(bubbleElement, data.action, resultText);
        }
    }

    // --- 暴露给 script.js 使用的 UI 方法 (代理) ---
    
    createMessageBubble(role, id, isStreaming) {
        return this.ui.createMessageBubble(role, id, isStreaming);
    }
}
