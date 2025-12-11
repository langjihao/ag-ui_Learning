/**
 * DwfUI
 * 负责 UI 渲染、事件绑定、DOM 操作
 */
export class DwfUI {
    constructor(domConfig) {
        this.dom = domConfig || {};
        
        // Markdown 渲染器配置
        this.md = window.markdownit({
            html: true,
            linkify: true,
            typographer: true,
            highlight: function (str, lang) {
                if (lang && window.hljs && window.hljs.getLanguage(lang)) {
                    try {
                        return '<pre class="hljs"><code>' +
                               window.hljs.highlight(str, { language: lang, ignoreIllegals: true }).value +
                               '</code></pre>';
                    } catch (__) {}
                }
                return '<pre class="hljs"><code>' + window.markdownit().utils.escapeHtml(str) + '</code></pre>';
            }
        });
    }

    bindEvents(onSend) {
        if (this.dom.sendBtn) {
            this.dom.sendBtn.addEventListener('click', () => onSend());
        }
        if (this.dom.userInput) {
            this.dom.userInput.addEventListener('keypress', (e) => {
                if(e.key === 'Enter') onSend();
            });
        }
    }

    getUserInput() {
        return (this.dom.userInput?.value || '').trim();
    }

    clearUserInput() {
        if (this.dom.userInput) this.dom.userInput.value = '';
    }

    setProcessingState(isProcessing) {
        if (this.dom.sendBtn) this.dom.sendBtn.disabled = isProcessing;
        if (!isProcessing && this.dom.userInput) this.dom.userInput.focus();
    }

    scrollToBottom() { 
        setTimeout(() => {
            const chatHistory = this.dom.chatHistory;
            if (chatHistory) chatHistory.scrollTop = chatHistory.scrollHeight; 
        }, 0);
    }

    renderMarkdown(text) { return text ? this.md.render(text) : ''; }

    createMessageBubble(role, id, isStreaming=false){
        const wrapper=document.createElement('div');
        wrapper.className=`message-wrapper ${role}`;
        const bubble=document.createElement('div');
        bubble.id=id;
        bubble.className=role==='user'?'user-bubble':'assistant-bubble';
        if(role==='assistant' && isStreaming) bubble.classList.add('typing-cursor');
        wrapper.appendChild(bubble);
        this.dom.chatHistory.appendChild(wrapper);
        return {wrapper, bubble};
    }

    createSystemMessage(text) {
        const wrapper = document.createElement('div');
        wrapper.className = 'message-wrapper system';
        wrapper.style.justifyContent = 'center';
        wrapper.innerHTML = `<div class="system-message" style="font-size:0.8rem; color:#6b7280;">${text}</div>`;
        this.dom.chatHistory.appendChild(wrapper);
        this.scrollToBottom();
    }

    createThinkingUI(parent) {
        const details = document.createElement('details');
        details.className = 'thinking-details';
        details.innerHTML = `
            <summary>思考过程 (Thinking)</summary>
            <div class="thinking-content"></div>
        `;
        parent.insertBefore(details, parent.firstChild);
        return details;
    }

    updateThinkingContent(thinkingEl, text) {
        if (thinkingEl) {
            const contentDiv = thinkingEl.querySelector('.thinking-content');
            if (contentDiv) contentDiv.textContent = text;
        }
    }

    updateMarkdownContent(contentEl, text) {
        if (contentEl) {
            contentEl.innerHTML = this.renderMarkdown(text);
            this.scrollToBottom();
        }
    }

    formatToolArgs(args) {
        if (!args || Object.keys(args).length === 0) return '';
        
        let html = '<div class="tool-args">';
        for (const [key, value] of Object.entries(args)) {
            let displayValue = value;
            if (typeof value === 'object') {
                try { displayValue = JSON.stringify(value); } catch(e) { displayValue = String(value); }
            }
            html += `<div class="arg-row"><span class="arg-key">${key}:</span> <span class="arg-val">${displayValue}</span></div>`;
        }
        html += '</div>';
        return html;
    }

    createHitlButtons(hitlData, aiBubble, onConfirm, onCancel) {
        const btnContainer = document.createElement('div');
        btnContainer.className = 'hitl-button-container';

        const confirmBtn = document.createElement('button');
        confirmBtn.textContent = hitlData.confirmText || '确认 (Yes)';
        confirmBtn.className = 'hitl-confirm-btn';
        confirmBtn.onclick = () => {
            btnContainer.remove();
            onConfirm();
        };
        btnContainer.appendChild(confirmBtn);

        const cancelBtn = document.createElement('button');
        cancelBtn.textContent = hitlData.cancelText || '取消 (No)';
        cancelBtn.className = 'hitl-cancel-btn';
        cancelBtn.onclick = () => {
            btnContainer.remove();
            onCancel();
        };
        btnContainer.appendChild(cancelBtn);
        
        aiBubble.appendChild(btnContainer);
        return btnContainer;
    }

    appendToolResult(bubble, toolName, result) {
        const resultHtml = `
            <div class="tool-result-display">
                <div class="tool-label">🔧 Tool Execution Result</div>
                <div class="tool-result">${result}</div>
            </div>`;
        bubble.insertAdjacentHTML('beforeend', resultHtml);
        this.scrollToBottom();
    }
    
    appendExecutedResult(bubble, toolName, result) {
         const resultHtml = `
            <div class="tool-result-display">
                <div class="tool-label">✅ Executed: ${toolName}</div>
                <div class="tool-result">${result}</div>
            </div>`;
         bubble.insertAdjacentHTML('beforeend', resultHtml);
         this.scrollToBottom();
    }

    appendError(bubble, message) {
        bubble.insertAdjacentHTML('beforeend', `<div class="error">${message}</div>`);
        this.scrollToBottom();
    }
}
