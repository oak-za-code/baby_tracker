// 记录功能模块JavaScript

// DOM元素
const recordTypeBtns = document.querySelectorAll('.record-type-btn');
const recordsContainer = document.getElementById('records-container');

// 当前选中的记录类型
let currentRecordType = null;

// 初始化记录功能
function initRecords() {
    // 如果没有选中的记录类型，默认显示喂奶记录
    if (!currentRecordType && recordTypeBtns.length > 0) {
        selectRecordType(recordTypeBtns[0].dataset.type);
    }
}

// 选择记录类型
function selectRecordType(type) {
    currentRecordType = type;
    
    // 更新按钮状态
    recordTypeBtns.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.type === type) {
            btn.classList.add('active');
        }
    });
    
    // 显示对应的记录表单
    showRecordForm(type);
    
    // 加载历史记录
    loadHistoryRecords(type);
}

// 显示记录表单
function showRecordForm(type) {
    let formHTML = '';
    
    switch (type) {
        case 'feeding':
            formHTML = createFeedingForm();
            break;
        case 'drinking':
            formHTML = createDrinkingForm();
            break;
        case 'diaper':
            formHTML = createDiaperForm();
            break;
        case 'sleep':
            formHTML = createSleepForm();
            break;
        case 'temperature':
            formHTML = createTemperatureForm();
            break;
        case 'bath':
            formHTML = createBathForm();
            break;
        case 'medicine':
            formHTML = createMedicineForm();
            break;
    }
    
    // 将表单HTML添加到容器中
    const containerHTML = `
        <div class="record-form-section">
            <h3>添加记录</h3>
            ${formHTML}
        </div>
        <div class="history-section">
            <h3>历史记录</h3>
            <div id="history-records" class="history-records-list"></div>
        </div>
    `;
    
    recordsContainer.innerHTML = containerHTML;
    
    // 添加表单提交事件监听
    const form = document.querySelector('.record-form');
    if (form) {
        form.addEventListener('submit', handleRecordSubmit);
    }
    
    // 如果是睡眠记录，添加特殊处理
    if (type === 'sleep') {
        initSleepRecordForm();
    }
}

// 创建喂奶表单
function createFeedingForm() {
    return `
        <form class="record-form" data-type="feeding">
            <div class="form-group">
                <label for="feeding-time">时间</label>
                <input type="datetime-local" id="feeding-time" required>
            </div>
            <div class="form-group">
                <label for="feeding-amount">奶量 (ml)</label>
                <input type="number" id="feeding-amount" min="0" step="1">
            </div>
            <div class="form-group">
                <label for="feeding-method">喂养方式</label>
                <select id="feeding-method">
                    <option value="">请选择</option>
                    <option value="breastfeeding">母乳喂养</option>
                    <option value="bottle">奶瓶喂养</option>
                    <option value="mixed">混合喂养</option>
                </select>
            </div>
            <div class="form-group">
                <label for="feeding-side">哺乳位置 (母乳喂养)</label>
                <select id="feeding-side">
                    <option value="">请选择</option>
                    <option value="left">左侧</option>
                    <option value="right">右侧</option>
                    <option value="both">两侧</option>
                </select>
            </div>
            <div class="form-group">
                <label for="feeding-notes">备注</label>
                <textarea id="feeding-notes" rows="3"></textarea>
            </div>
            <button type="submit" class="primary-btn">保存记录</button>
        </form>
    `;
}

// 创建喝水表单
function createDrinkingForm() {
    return `
        <form class="record-form" data-type="drinking">
            <div class="form-group">
                <label for="drinking-time">时间</label>
                <input type="datetime-local" id="drinking-time" required>
            </div>
            <div class="form-group">
                <label for="drinking-amount">水量 (ml)</label>
                <input type="number" id="drinking-amount" min="0" step="1" required>
            </div>
            <div class="form-group">
                <label for="drinking-type">水类型</label>
                <select id="drinking-type">
                    <option value="">请选择</option>
                    <option value="water">温水</option>
                    <option value="juice">果汁</option>
                    <option value="other">其他</option>
                </select>
            </div>
            <div class="form-group">
                <label for="drinking-notes">备注</label>
                <textarea id="drinking-notes" rows="3"></textarea>
            </div>
            <button type="submit" class="primary-btn">保存记录</button>
        </form>
    `;
}

// 创建尿布表单
function createDiaperForm() {
    return `
        <form class="record-form" data-type="diaper">
            <div class="form-group">
                <label for="diaper-time">时间</label>
                <input type="datetime-local" id="diaper-time" required>
            </div>
            <div class="form-group">
                <label>尿布类型</label>
                <div class="radio-group">
                    <label><input type="radio" name="diaper-type" value="pee" checked> 小便</label>
                    <label><input type="radio" name="diaper-type" value="poop"> 大便</label>
                    <label><input type="radio" name="diaper-type" value="both"> 两者都有</label>
                </div>
            </div>
            <div class="form-group">
                <label for="diaper-notes">备注</label>
                <textarea id="diaper-notes" rows="3"></textarea>
            </div>
            <button type="submit" class="primary-btn">保存记录</button>
        </form>
    `;
}

// 创建睡眠表单
function createSleepForm() {
    return `
        <form class="record-form" data-type="sleep">
            <div class="form-group">
                <label for="sleep-start-time">开始时间</label>
                <input type="datetime-local" id="sleep-start-time" required>
            </div>
            <div class="form-group">
                <label for="sleep-end-time">结束时间</label>
                <input type="datetime-local" id="sleep-end-time">
                <p class="form-hint">留空表示睡眠进行中</p>
            </div>
            <div class="form-group">
                <label for="sleep-location">睡眠位置</label>
                <select id="sleep-location">
                    <option value="">请选择</option>
                    <option value="crib">婴儿床</option>
                    <option value="bed">大床</option>
                    <option value="carrier">婴儿车</option>
                    <option value="other">其他</option>
                </select>
            </div>
            <div class="form-group">
                <label for="sleep-notes">备注</label>
                <textarea id="sleep-notes" rows="3"></textarea>
            </div>
            <button type="submit" class="primary-btn">保存记录</button>
        </form>
    `;
}

// 创建体温表单
function createTemperatureForm() {
    return `
        <form class="record-form" data-type="temperature">
            <div class="form-group">
                <label for="temperature-time">时间</label>
                <input type="datetime-local" id="temperature-time" required>
            </div>
            <div class="form-group">
                <label for="temperature-value">体温 (°C)</label>
                <input type="number" id="temperature-value" min="35" max="42" step="0.1" required>
            </div>
            <div class="form-group">
                <label for="temperature-method">测量部位</label>
                <select id="temperature-method">
                    <option value="">请选择</option>
                    <option value="armpit">腋下</option>
                    <option value="ear">耳朵</option>
                    <option value="forehead">额头</option>
                    <option value="other">其他</option>
                </select>
            </div>
            <div class="form-group">
                <label for="temperature-notes">备注</label>
                <textarea id="temperature-notes" rows="3"></textarea>
            </div>
            <button type="submit" class="primary-btn">保存记录</button>
        </form>
    `;
}

// 创建洗澡表单
function createBathForm() {
    return `
        <form class="record-form" data-type="bath">
            <div class="form-group">
                <label for="bath-time">时间</label>
                <input type="datetime-local" id="bath-time" required>
            </div>
            <div class="form-group">
                <label for="bath-duration">洗澡时长 (分钟)</label>
                <input type="number" id="bath-duration" min="1" step="1">
            </div>
            <div class="form-group">
                <label for="bath-notes">备注</label>
                <textarea id="bath-notes" rows="3"></textarea>
            </div>
            <button type="submit" class="primary-btn">保存记录</button>
        </form>
    `;
}

// 创建用药表单
function createMedicineForm() {
    return `
        <form class="record-form" data-type="medicine">
            <div class="form-group">
                <label for="medicine-time">时间</label>
                <input type="datetime-local" id="medicine-time" required>
            </div>
            <div class="form-group">
                <label for="medicine-name">药物名称</label>
                <input type="text" id="medicine-name" required>
            </div>
            <div class="form-group">
                <label for="medicine-dose">剂量</label>
                <input type="text" id="medicine-dose" required>
            </div>
            <div class="form-group">
                <label for="medicine-purpose">用药原因</label>
                <input type="text" id="medicine-purpose">
            </div>
            <div class="form-group">
                <label for="medicine-notes">备注</label>
                <textarea id="medicine-notes" rows="3"></textarea>
            </div>
            <button type="submit" class="primary-btn">保存记录</button>
        </form>
    `;
}

// 初始化睡眠记录表单
function initSleepRecordForm() {
    const startTimeInput = document.getElementById('sleep-start-time');
    const endTimeInput = document.getElementById('sleep-end-time');
    
    // 设置默认时间为当前时间
    const now = new Date();
    startTimeInput.value = formatDateTimeLocal(now);
    
    // 查找正在进行的睡眠记录
    const data = getData();
    const ongoingSleep = data.records.find(record => 
        record.type === 'sleep' && !record.endTime
    );
    
    if (ongoingSleep) {
        startTimeInput.value = formatDateTimeLocal(new Date(ongoingSleep.startTime));
        startTimeInput.disabled = true;
        
        // 如果有正在进行的睡眠，将结束时间设置为当前时间
        endTimeInput.value = formatDateTimeLocal(now);
    }
}

// 处理记录提交
function handleRecordSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const type = form.dataset.type;
    const record = { id: generateId(), type, timestamp: Date.now() };
    
    // 根据记录类型收集数据
    switch (type) {
        case 'feeding':
            record.time = new Date(document.getElementById('feeding-time').value).getTime();
            record.amount = document.getElementById('feeding-amount').value;
            record.method = document.getElementById('feeding-method').value;
            record.side = document.getElementById('feeding-side').value;
            record.notes = document.getElementById('feeding-notes').value;
            break;
        case 'drinking':
            record.time = new Date(document.getElementById('drinking-time').value).getTime();
            record.amount = document.getElementById('drinking-amount').value;
            record.drinkType = document.getElementById('drinking-type').value;
            record.notes = document.getElementById('drinking-notes').value;
            break;
        case 'diaper':
            record.time = new Date(document.getElementById('diaper-time').value).getTime();
            record.diaperType = document.querySelector('input[name="diaper-type"]:checked').value;
            record.notes = document.getElementById('diaper-notes').value;
            break;
        case 'sleep':
            record.startTime = new Date(document.getElementById('sleep-start-time').value).getTime();
            const endTimeValue = document.getElementById('sleep-end-time').value;
            if (endTimeValue) {
                record.endTime = new Date(endTimeValue).getTime();
            }
            record.location = document.getElementById('sleep-location').value;
            record.notes = document.getElementById('sleep-notes').value;
            break;
        case 'temperature':
            record.time = new Date(document.getElementById('temperature-time').value).getTime();
            record.temperature = document.getElementById('temperature-value').value;
            record.method = document.getElementById('temperature-method').value;
            record.notes = document.getElementById('temperature-notes').value;
            break;
        case 'bath':
            record.time = new Date(document.getElementById('bath-time').value).getTime();
            record.duration = document.getElementById('bath-duration').value;
            record.notes = document.getElementById('bath-notes').value;
            break;
        case 'medicine':
            record.time = new Date(document.getElementById('medicine-time').value).getTime();
            record.name = document.getElementById('medicine-name').value;
            record.dose = document.getElementById('medicine-dose').value;
            record.purpose = document.getElementById('medicine-purpose').value;
            record.notes = document.getElementById('medicine-notes').value;
            break;
    }
    
    // 保存记录
    saveRecord(record);
    
    // 重置表单
    if (type !== 'sleep' || record.endTime) {
        form.reset();
        // 为新记录设置默认时间
        const timeInput = form.querySelector('input[type="datetime-local"]');
        if (timeInput) {
            timeInput.value = formatDateTimeLocal(new Date());
        }
    } else {
        // 对于开始睡眠的记录，禁用开始时间输入
        const startTimeInput = document.getElementById('sleep-start-time');
        if (startTimeInput) {
            startTimeInput.disabled = true;
        }
    }
    
    // 重新加载历史记录
    loadHistoryRecords(type);
    
    // 显示成功消息
    showNotification('记录保存成功！');
    
    // 更新首页数据
    if (window.updateStats && window.loadRecentRecords) {
        window.updateStats();
        window.loadRecentRecords();
    }
}

// 保存记录
function saveRecord(record) {
    const data = getData();
    
    // 如果是结束睡眠记录，查找并更新对应的开始记录
    if (record.type === 'sleep' && record.endTime) {
        const ongoingSleepIndex = data.records.findIndex(r => 
            r.type === 'sleep' && r.startTime === record.startTime && !r.endTime
        );
        
        if (ongoingSleepIndex !== -1) {
            data.records[ongoingSleepIndex].endTime = record.endTime;
            data.records[ongoingSleepIndex].location = record.location;
            data.records[ongoingSleepIndex].notes = record.notes;
        } else {
            // 如果没有找到对应的开始记录，添加新记录
            data.records.push(record);
        }
    } else {
        // 添加新记录
        data.records.push(record);
    }
    
    saveData(data);
}

// 加载历史记录
function loadHistoryRecords(type) {
    const data = getData();
    const historyContainer = document.getElementById('history-records');
    
    // 筛选指定类型的记录并按时间倒序排序
    const typeRecords = data.records
        .filter(record => record.type === type)
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 10);
    
    if (typeRecords.length === 0) {
        historyContainer.innerHTML = `
            <div class="empty-state">
                <p>暂无记录</p>
            </div>
        `;
        return;
    }
    
    historyContainer.innerHTML = '';
    
    typeRecords.forEach(record => {
        const recordItem = document.createElement('div');
        recordItem.className = 'history-record-item';
        
        const formattedTime = formatDateTime(record.timestamp);
        const detailsHTML = getRecordDetailsHTML(record);
        
        recordItem.innerHTML = `
            <div class="record-header">
                <div class="record-time">${formattedTime}</div>
                <div class="record-actions">
                    <button class="icon-btn edit-record-small" data-id="${record.id}">✏️</button>
                    <button class="icon-btn delete-record-small" data-id="${record.id}">🗑️</button>
                </div>
            </div>
            <div class="record-details">${detailsHTML}</div>
        `;
        
        historyContainer.appendChild(recordItem);
    });
    
    // 添加事件监听器
    document.querySelectorAll('.edit-record-small').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const recordId = e.currentTarget.dataset.id;
            editRecord(recordId);
        });
    });
    
    document.querySelectorAll('.delete-record-small').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const recordId = e.currentTarget.dataset.id;
            if (confirm('确定要删除这条记录吗？')) {
                deleteRecord(recordId);
                loadHistoryRecords(type);
                
                // 更新首页数据
                if (window.updateStats && window.loadRecentRecords) {
                    window.updateStats();
                    window.loadRecentRecords();
                }
            }
        });
    });
}

// 获取记录详情HTML
function getRecordDetailsHTML(record) {
    let details = '';
    
    switch (record.type) {
        case 'feeding':
            details = `
                <div>奶量: ${record.amount || '--'} ml</div>
                <div>喂养方式: ${getFeedingMethodLabel(record.method)}</div>
                ${record.side ? `<div>哺乳位置: ${getSideLabel(record.side)}</div>` : ''}
                ${record.notes ? `<div>备注: ${record.notes}</div>` : ''}
            `;
            break;
        case 'drinking':
            details = `
                <div>水量: ${record.amount} ml</div>
                <div>类型: ${getDrinkTypeLabel(record.drinkType)}</div>
                ${record.notes ? `<div>备注: ${record.notes}</div>` : ''}
            `;
            break;
        case 'diaper':
            details = `
                <div>类型: ${getDiaperTypeLabel(record.diaperType)}</div>
                ${record.notes ? `<div>备注: ${record.notes}</div>` : ''}
            `;
            break;
        case 'sleep':
            const startTime = new Date(record.startTime).toLocaleTimeString('zh-CN', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
            if (record.endTime) {
                const endTime = new Date(record.endTime).toLocaleTimeString('zh-CN', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                });
                const duration = Math.round((record.endTime - record.startTime) / 60000);
                details = `
                    <div>时间: ${startTime} - ${endTime}</div>
                    <div>持续: ${Math.floor(duration / 60)}小时${duration % 60}分钟</div>
                    ${record.location ? `<div>位置: ${getSleepLocationLabel(record.location)}</div>` : ''}
                    ${record.notes ? `<div>备注: ${record.notes}</div>` : ''}
                `;
            } else {
                details = `
                    <div>开始时间: ${startTime}</div>
                    <div><strong>状态: 进行中</strong></div>
                    ${record.location ? `<div>位置: ${getSleepLocationLabel(record.location)}</div>` : ''}
                    ${record.notes ? `<div>备注: ${record.notes}</div>` : ''}
                `;
            }
            break;
        case 'temperature':
            details = `
                <div>体温: ${record.temperature}°C</div>
                <div>测量部位: ${getTemperatureMethodLabel(record.method)}</div>
                ${record.notes ? `<div>备注: ${record.notes}</div>` : ''}
            `;
            break;
        case 'bath':
            details = `
                <div>时长: ${record.duration || '--'} 分钟</div>
                ${record.notes ? `<div>备注: ${record.notes}</div>` : ''}
            `;
            break;
        case 'medicine':
            details = `
                <div>药物: ${record.name}</div>
                <div>剂量: ${record.dose}</div>
                ${record.purpose ? `<div>原因: ${record.purpose}</div>` : ''}
                ${record.notes ? `<div>备注: ${record.notes}</div>` : ''}
            `;
            break;
    }
    
    return details;
}

// 获取喂养方式标签
function getFeedingMethodLabel(method) {
    const labels = {
        breastfeeding: '母乳喂养',
        bottle: '奶瓶喂养',
        mixed: '混合喂养'
    };
    return labels[method] || '--';
}

// 获取哺乳位置标签
function getSideLabel(side) {
    const labels = {
        left: '左侧',
        right: '右侧',
        both: '两侧'
    };
    return labels[side] || '--';
}

// 获取水类型标签
function getDrinkTypeLabel(type) {
    const labels = {
        water: '温水',
        juice: '果汁',
        other: '其他'
    };
    return labels[type] || '--';
}

// 获取尿布类型标签
function getDiaperTypeLabel(type) {
    const labels = {
        pee: '小便',
        poop: '大便',
        both: '两者都有'
    };
    return labels[type] || '--';
}

// 获取睡眠位置标签
function getSleepLocationLabel(location) {
    const labels = {
        crib: '婴儿床',
        bed: '大床',
        carrier: '婴儿车',
        other: '其他'
    };
    return labels[location] || '--';
}

// 获取体温测量方法标签
function getTemperatureMethodLabel(method) {
    const labels = {
        armpit: '腋下',
        ear: '耳朵',
        forehead: '额头',
        other: '其他'
    };
    return labels[method] || '--';
}

// 格式化日期时间
function formatDateTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleDateString('zh-CN', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// 格式化日期时间为local格式
function formatDateTimeLocal(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
}

// 显示通知
function showNotification(message) {
    // 创建通知元素
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    // 添加到文档
    document.body.appendChild(notification);
    
    // 设置样式（如果CSS中没有定义）
    notification.style.position = 'fixed';
    notification.style.bottom = '20px';
    notification.style.left = '50%';
    notification.style.transform = 'translateX(-50%)';
    notification.style.background = 'var(--success-color)';
    notification.style.color = 'white';
    notification.style.padding = '10px 20px';
    notification.style.borderRadius = '5px';
    notification.style.boxShadow = 'var(--shadow-md)';
    notification.style.zIndex = '1000';
    notification.style.opacity = '0';
    notification.style.transition = 'opacity 0.3s ease';
    
    // 显示通知
    setTimeout(() => {
        notification.style.opacity = '1';
    }, 10);
    
    // 3秒后隐藏通知
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// 编辑记录（扩展app.js中的函数）
window.editRecord = function(recordId) {
    const data = getData();
    const record = data.records.find(r => r.id === recordId);
    
    if (!record) return;
    
    // 切换到相应的记录标签
    switchTab('records');
    selectRecordType(record.type);
    
    // 填充表单数据
    setTimeout(() => {
        fillRecordForm(record);
    }, 100);
};

// 填充记录表单
function fillRecordForm(record) {
    const form = document.querySelector(`.record-form[data-type="${record.type}"]`);
    if (!form) return;
    
    switch (record.type) {
        case 'feeding':
            document.getElementById('feeding-time').value = formatDateTimeLocal(new Date(record.time));
            document.getElementById('feeding-amount').value = record.amount || '';
            document.getElementById('feeding-method').value = record.method || '';
            document.getElementById('feeding-side').value = record.side || '';
            document.getElementById('feeding-notes').value = record.notes || '';
            break;
        case 'drinking':
            document.getElementById('drinking-time').value = formatDateTimeLocal(new Date(record.time));
            document.getElementById('drinking-amount').value = record.amount || '';
            document.getElementById('drinking-type').value = record.drinkType || '';
            document.getElementById('drinking-notes').value = record.notes || '';
            break;
        case 'diaper':
            document.getElementById('diaper-time').value = formatDateTimeLocal(new Date(record.time));
            const diaperTypeInput = document.querySelector(`input[name="diaper-type"][value="${record.diaperType}"]`);
            if (diaperTypeInput) diaperTypeInput.checked = true;
            document.getElementById('diaper-notes').value = record.notes || '';
            break;
        case 'sleep':
            document.getElementById('sleep-start-time').value = formatDateTimeLocal(new Date(record.startTime));
            if (record.endTime) {
                document.getElementById('sleep-end-time').value = formatDateTimeLocal(new Date(record.endTime));
            }
            document.getElementById('sleep-location').value = record.location || '';
            document.getElementById('sleep-notes').value = record.notes || '';
            break;
        case 'temperature':
            document.getElementById('temperature-time').value = formatDateTimeLocal(new Date(record.time));
            document.getElementById('temperature-value').value = record.temperature || '';
            document.getElementById('temperature-method').value = record.method || '';
            document.getElementById('temperature-notes').value = record.notes || '';
            break;
        case 'bath':
            document.getElementById('bath-time').value = formatDateTimeLocal(new Date(record.time));
            document.getElementById('bath-duration').value = record.duration || '';
            document.getElementById('bath-notes').value = record.notes || '';
            break;
        case 'medicine':
            document.getElementById('medicine-time').value = formatDateTimeLocal(new Date(record.time));
            document.getElementById('medicine-name').value = record.name || '';
            document.getElementById('medicine-dose').value = record.dose || '';
            document.getElementById('medicine-purpose').value = record.purpose || '';
            document.getElementById('medicine-notes').value = record.notes || '';
            break;
    }
    
    // 添加一个隐藏字段来存储记录ID，以便更新
    let idInput = form.querySelector('input[name="record-id"]');
    if (!idInput) {
        idInput = document.createElement('input');
        idInput.type = 'hidden';
        idInput.name = 'record-id';
        form.appendChild(idInput);
    }
    idInput.value = record.id;
}

// 事件监听器
function initRecordsEventListeners() {
    // 记录类型按钮点击事件
    recordTypeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            selectRecordType(btn.dataset.type);
        });
    });
}

// 页面加载完成后初始化
window.addEventListener('load', () => {
    initRecords();
    initRecordsEventListeners();
});