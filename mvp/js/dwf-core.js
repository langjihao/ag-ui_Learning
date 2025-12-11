/**
 * DwfCore
 * 负责核心逻辑：网络通信、协议解析、工具管理、状态维护
 * 不包含任何 DOM 操作
 */
export class DwfCore {
    constructor(config) {
        this.sessionId = 'session-' + Date.now();
        this.config = {
            webhookUrl: config.webhookUrl,
            getState: config.getState || (() => ({})),
        };
        
        this.tools = { hitltools: {}, dwftools: {} };
        this.isProcessing = false;
        this.pendingHitlRequest = null;
        
        // 状态管理
        this.state = {
            thinking: '',
            content: '',
            isThinking: false
        };
    }

    /**
     * 注册工具
     */
    registerTool(definition, handler) {
        const { name, type = 'dwftools' } = definition;
        const registry = this.tools[type] || this.tools.dwftools;
        if (!this.tools[type] && type !== 'dwftools') {
            console.warn(`Unknown tool type: ${type}, defaulting to dwftools`);
        }
        registry[name] = { definition, handler };
    }

    getToolsSchema() {
        const collect = (type) => Object.values(this.tools[type]).map(({ definition }) => definition);
        return {
            hitltools: collect('hitltools'),
            dwftools: collect('dwftools')
        };
    }

    /**
     * 执行工具
     */
    executeTool(toolName, args, context) {
        const tool = this.tools.dwftools[toolName] || this.tools.hitltools[toolName];
        let result = '';

        if (tool && tool.handler) {
            try {
                console.log(`Executing tool: ${toolName}, args: ${JSON.stringify(args)}`);
                // 传入 context (通常是 DwfCopilot 实例) 以便工具可能需要访问 UI 或其他方法
                result = tool.handler(args, context);
            } catch (e) {
                result = `执行工具 ${toolName} 时出错: ${e.message}`;
                console.error(e);
            }
        } else {
            result = `操作执行完成: ${toolName} (未找到本地实现)`;
        }
        return result;
    }

    /**
     * 发送消息的核心逻辑
     * @param {Object} params - { userText, extraPayload, onChunk, onStart, onEnd, onError }
     */
    async sendMessage({ userText, extraPayload, onChunk, onStart, onEnd, onError }) {
        if (this.isProcessing) return;
        this.isProcessing = true;

        // 1. 构建 Payload
        let payload = {
            chatInput: userText || '',
            sessionId: this.sessionId,
            appState: this.config.getState(), 
            tools: this.getToolsSchema(),
        };
        
        if (extraPayload) {
            Object.assign(payload, extraPayload);
            if (extraPayload.hitlResponse) {
                payload.hitlRequest = this.pendingHitlRequest; 
                this.pendingHitlRequest = null; 
            }
        }

        // 重置流式状态
        this.state.thinking = '';
        this.state.content = '';
        this.state.isThinking = false;

        if (onStart) onStart();

        try {
            const response = await fetch(this.config.webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            
            if(!response.ok) throw new Error('Network error or AI Agent inactive.');

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = "";
            
            while(true){
                const {done, value} = await reader.read();
                if(done) break;
                const chunk = decoder.decode(value, {stream: true});
                buffer += chunk;
                const lines = buffer.split('\n');
                buffer = lines.pop();
                
                for(const line of lines){
                    if(!line.trim()) continue;
                    try{
                        const json = JSON.parse(line);
                        if(json.type === 'item' && json.content){
                            this._processStreamChunk(json.content, onChunk);
                        }
                    }catch(e){}
                }
            }
        } catch(error) {
            if (onError) onError(error);
        } finally {
            this.isProcessing = false;
            if (onEnd) onEnd(this.state.content);
        }
    }

    _processStreamChunk(chunk, onChunk) {
        let remaining = chunk;
        
        while (remaining.length > 0) {
            if (!this.state.isThinking) {
                const startIdx = remaining.indexOf('<think>');
                if (startIdx !== -1) {
                    const contentPart = remaining.substring(0, startIdx);
                    this.state.content += contentPart;
                    if (onChunk) onChunk({ type: 'content', text: contentPart, full: this.state.content });
                    
                    this.state.isThinking = true;
                    remaining = remaining.substring(startIdx + 7);
                    if (onChunk) onChunk({ type: 'thinking_start' });
                } else {
                    this.state.content += remaining;
                    if (onChunk) onChunk({ type: 'content', text: remaining, full: this.state.content });
                    remaining = '';
                }
            } else {
                const endIdx = remaining.indexOf('</think>');
                if (endIdx !== -1) {
                    const thinkingPart = remaining.substring(0, endIdx);
                    this.state.thinking += thinkingPart;
                    if (onChunk) onChunk({ type: 'thinking', text: thinkingPart, full: this.state.thinking });
                    
                    this.state.isThinking = false;
                    remaining = remaining.substring(endIdx + 8);
                    if (onChunk) onChunk({ type: 'thinking_end' });
                } else {
                    this.state.thinking += remaining;
                    if (onChunk) onChunk({ type: 'thinking', text: remaining, full: this.state.thinking });
                    remaining = '';
                }
            }
        }
    }

    parseJsonPayload(text) {
        const codeBlockMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
        const inlineMatch = text.match(/(\{[\s\S]*\})/);
        const jsonStr = codeBlockMatch ? codeBlockMatch[1] : (inlineMatch ? inlineMatch[1] : null);
        if (!jsonStr) return null;
        try {
            return JSON.parse(jsonStr);
        } catch (e) {
            console.error('JSON parse error:', e);
            return null;
        }
    }

    buildHitlRequest(data, isClientSide) {
        const request = {
            action: isClientSide ? data.action : data.hitl_action,
            data: data.data || {},
            message: data.message || `请求执行操作: ${isClientSide ? data.action : data.hitl_action}`,
            confirmText: data.confirm_text || '确认',
            cancelText: data.cancel_text || '取消'
        };
        this.pendingHitlRequest = request;
        return request;
    }
}
