import { DwfCopilot } from './dwf-copilot.js';

// --- 业务层状态与逻辑 ---

// 应用状态
const appState = {
    theme: '#d3d7deff',
    currentPage: 'part-list',
    pageData: [
        { id: '1395T3130506', customer: 'Kostal', rev: 'A01', ptype: 'MLB' },
        { id: '1395T3330501', customer: 'H2', rev: 'A02', ptype: 'MLB' },
        { id: 'AC3836004001', customer: 'Kostal', rev: 'A01', ptype: 'PC' }
    ],
    isUserLoggedIn: true,
    userInfo: {
        oid: 'user-12345',
        username: 'test_user',
        displayName: '测试用户'
    }
};

// DOM 元素引用
const dom = {
    chatHistory: document.getElementById('chat-history'),
    userInput: document.getElementById('user-input'),
    sendBtn: document.getElementById('send-btn'),
    appContainer: document.querySelector('body'),
    inventoryTableContainer: document.getElementById('inventory-table-container')
};

// --- 业务逻辑函数 ---

function getNewPartId() { 
    return 'N' + Math.floor(Math.random() * 9999).toString().padStart(4, '0'); 
}

function renderInventoryTable() {
    let html = `<table id='inventory-table'>
        <thead>
            <tr><th>Pn</th><th>Customer</th><th>Rev</th><th>Ptype</th><th>Action</th></tr>
        </thead>
        <tbody>`;
    
    appState.pageData.forEach(item => {
        html += `
            <tr data-id='${item.id}'>
                <td>${item.id}</td>
                <td class='editable-cell' onclick='editCell("${item.id}", "customer", this)'>${item.customer}</td>
                <td class='editable-cell' onclick='editCell("${item.id}", "rev", this)'>${item.rev}</td>
                <td class='editable-cell' onclick='editptype("${item.id}", this)'>${item.ptype}</td>
                <td>
                    <button class='delete-btn action-btn' onclick='deletePartManual("${item.id}")'>删除</button>
                </td>
            </tr>`;
    });

    html += `</tbody></table>`;
    dom.inventoryTableContainer.innerHTML = html;
}

function addNewPart() {
    const newId = getNewPartId();
    appState.pageData.unshift({
        id: newId,
        customer: '新part',
        rev: 'A01',
        ptype: 'MLB'
    });
    renderInventoryTable();
}

function deletePartManual(id) {
    if (confirm(`确认要手动删除 pn 为 ${id} 的part吗？`)) {
        appState.pageData = appState.pageData.filter(item => item.id !== id);
        renderInventoryTable();
    }
}

function editCell(id, field, cell) {
    if (cell.querySelector('input')) return;
    const originalValue = cell.textContent;
    cell.innerHTML = `<input type='text' value='${originalValue}' 
                      onblur='saveCellEdit("${id}", "${field}", this.value, this)' 
                      onkeypress='if(event.key === "Enter") this.blur()' style='width:100%;'>`;
    cell.querySelector('input').focus();
}

function editptype(id, cell) {
    if (cell.querySelector('select')) return;
    const currentptype = cell.textContent.trim();
    
    const options = [
        { label: 'MLB-Main Logical Board', value: 'MLB' },
        { label: 'P-H/W Raw Material', value: 'P' },
        { label: 'PC-Finish Goods Level', value: 'PC' }
    ];

    let optionsHtml = options.map(opt => 
        `<option value='${opt.value}' ${opt.value === currentptype ? 'selected' : ''}>${opt.label}</option>`
    ).join('');

    cell.innerHTML = `<select onblur='saveCellEdit("${id}", "ptype", this.value, this)' 
                              onchange='this.blur()' style='width:100%;'>
                        ${optionsHtml}
                      </select>`;
    cell.querySelector('select').focus();
}

function saveCellEdit(id, field, newValue, inputElement) {
    const part = appState.pageData.find(item => item.id === id);

    if (part[field] != newValue) {
        part[field] = newValue;
        renderInventoryTable(); 
    } else {
        renderInventoryTable();
    }
}

// --- 初始化 Copilot ---

// 确保 DwfCopilot 已加载
if (typeof DwfCopilot === 'undefined') {
    console.error('DwfCopilot library not loaded!');
}

const copilot = new DwfCopilot({
    dom: dom,
    getState: () => appState,
    onInit: (instance) => {
        // 初始化 UI
        renderInventoryTable();
        dom.appContainer.style.backgroundColor = appState.theme;
        
        // 欢迎消息
        const welcomeBubble = instance.createMessageBubble('assistant', 'welcome-msg').bubble;
        instance.finalizeMessage(welcomeBubble, 
            `欢迎使用 DWF Copilot！\n\n请查看左侧的**part List表格**。\n\n**尝试输入：**\n1. 增加一个pn为1395A0007901 part，版本是B01\n2. 删除 pn 为 1395T3130506的part\n3. 把 AC3836004001 的版本改为 B01\n4. 把背景颜色改为浅绿色`);
        
        dom.userInput.focus();
    }
});

// --- 注册业务工具 ---

// change_background
copilot.registerTool({
    name: 'change_background',
    description: '修改应用背景颜色',
    params: {
        type: 'object',
        properties: {
            color: { type: 'string', description: '十六进制颜色代码 (例如 #ffffff)' }
        },
        required: ['color']
    }
}, (args) => {
    const color = args.color || '#ffffff';
    appState.theme = color;
    dom.appContainer.style.backgroundColor = color;
    return `背景已成功修改为: ${color}`;
});

// add_part
copilot.registerTool({
    name: 'add_part',
    description: '添加一个新的 part 到库存列表',
    params: {
        type: 'object',
        properties: {
            id: { type: 'string', description: 'Part Number (PN)' },
            customer: { type: 'string', description: '客户名称' },
            rev: { type: 'string', description: '版本号' },
            ptype: { type: 'string', description: 'Part Type (MLB, PC, etc.)' }
        },
        required: ['id']
    }
}, (args) => {
    const newId = args.id
    
    const newPart = {
        id: newId,
        customer: args.customer || 'AI添加的part',
        rev: args.rev || 'A01',
        ptype: args.ptype || 'MLB'
    };
    appState.pageData.unshift(newPart);
    renderInventoryTable();
    return `已成功添加新part pn: ${newId} (客户: ${newPart.customer})`;
});

// delete_part (注册为 HITL 工具)
copilot.registerTool({
    name: 'delete_part',
    type: 'hitltools',
    description: '删除指定的 part',
    params: {
        type: 'object',
        properties: {
            pn: { 
                type: 'array', 
                items: { type: 'string' },
                description: '要删除的 Part ID 列表或单个 ID'
            }
        },
        required: ['pn']
    }
}, (args) => {
    const idsToDelete = Array.isArray(args.pn) ? args.pn : [args.pn];
    const initialCount = appState.pageData.length;
    let deletedParts = [];

    idsToDelete.forEach(pn => {
        const part = appState.pageData.find(item => item.id === pn);
        if (part) {
            deletedParts.push(`${pn} (${part.customer})`);
            appState.pageData = appState.pageData.filter(item => item.id !== pn);
        }
    });

    const deletedCount = initialCount - appState.pageData.length;
    
    renderInventoryTable();

    if (deletedCount === 0) return `错误: 未找到 pn 为 ${idsToDelete.join('、')} 的part。`;
    else if (deletedCount === 1) return `part ${deletedParts[0]} 已被成功删除。`;
    else return `已成功删除以下 ${deletedCount} 个part: ${deletedParts.join('、')}。`;
});

// update_part
copilot.registerTool({
    name: 'update_part',
    type: 'hitltools',
    description: '更新 part 的信息',
    params: {
        type: 'object',
        properties: {
            id: { type: 'string', description: 'Part ID' },
            customer: { type: 'string', description: '新客户名称' },
            rev: { type: 'string', description: '新版本号' },
            ptype: { type: 'string', description: '新 Part Type' }
        },
        required: ['id']
    }
}, (args) => {
    const id = args.id;
    const part = appState.pageData.find(item => item.id === id);
    
    let updates = [];
    if (args.customer) { part.customer = args.customer; updates.push(`客户改为 ${args.customer}`); }
    if (args.rev) { part.rev = args.rev; updates.push(`版本改为 ${args.rev}`); }
    if (args.ptype) { part.ptype = args.ptype; updates.push(`Ptype改为 ${args.ptype}`); }

    if (updates.length > 0) {
        renderInventoryTable();
        return `part ${id} 的信息已更新: ${updates.join(', ')}`;
    }
    else return `part ${id} 未进行任何有效更新。`;
});

// get_inventory_summary
copilot.registerTool({
    name: 'get_inventory_summary',
    description: '获取PartList摘要信息',
    params: { type: 'object', properties: {} }
}, (args) => {
     const totalParts = appState.pageData.length;
     const mlbParts = appState.pageData.filter(p => p.ptype === 'MLB').length;
     return `系统中有 ${totalParts} 个part，其中 ${mlbParts} 个是 MLB。`;
});

// 暴露给全局以便 HTML 中的 onclick 调用
window.addNewPart = addNewPart;
window.deletePartManual = deletePartManual;
window.editCell = editCell;
window.editptype = editptype;
window.saveCellEdit = saveCellEdit;
copilot.deletePartManual = deletePartManual;
copilot.editCell = editCell;
copilot.editptype = editptype;
copilot.saveCellEdit = saveCellEdit;
