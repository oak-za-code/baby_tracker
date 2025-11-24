// 主应用JavaScript文件

// 全局函数已在storage.js和utils.js中定义，直接使用

// DOM元素
const tabBtns = document.querySelectorAll('.tab-btn');
const tabPanels = document.querySelectorAll('.tab-panel');
const bottomNavItems = document.querySelectorAll('.nav-item');
const floatingAddBtn = document.getElementById('floating-add-btn');
const modalContainer = document.getElementById('modal-container');
const closeModalBtn = document.getElementById('close-modal');
const modalTitle = document.getElementById('modal-title');
const modalContent = document.getElementById('modal-content');
const pageTitle = document.getElementById('page-title');
const addBtn = document.getElementById('add-btn');

// 应用状态
let currentTab = 'dashboard';

// 初始化应用
function initApp() {
    // 初始化数据存储
    if (!localStorage.getItem('baby_tracker_data')) {
        const initialData = {
            records: [],
            reminders: [],
            settings: {
                babyName: '宝宝',
                theme: 'light',
                soundEnabled: true
            }
        };
        localStorage.setItem('baby_tracker_data', JSON.stringify(initialData));
    }
    
    // 更新页面标题
    updatePageTitle();
    
    // 加载最近记录
    loadRecentRecords();
    
    // 更新统计数据
    updateStats();
    
    // 加载提醒
    loadReminders();
}

// 更新页面标题
function updatePageTitle() {
    const data = getData();
    if (pageTitle) {
        pageTitle.textContent = `${(data.settings && data.settings.babyName) || '宝宝'}的记录`;
    }
}



// 切换标签
function switchTab(tabId) {
    // 更新当前标签
    currentTab = tabId;
    
    // 更新标签按钮状态
    tabBtns.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.tab === tabId) {
            btn.classList.add('active');
        }
    });
    
    // 更新底部导航状态
    bottomNavItems.forEach(item => {
        item.classList.remove('active');
        if (item.dataset.tab === tabId) {
            item.classList.add('active');
        }
    });
    
    // 更新面板显示
    tabPanels.forEach(panel => {
        panel.classList.remove('active');
        if (panel.id === tabId) {
            panel.classList.add('active');
        }
    });
    
    // 根据当前标签刷新数据
    if (tabId === 'dashboard') {
        loadRecentRecords();
        updateStats();
    } else if (tabId === 'reminders') {
        loadReminders();
    }
}

// 打开模态框
function openModal(title, contentHTML) {
    modalTitle.textContent = title;
    modalContent.innerHTML = contentHTML;
    modalContainer.classList.add('active');
}

// 关闭模态框
function closeModal() {
    modalContainer.classList.remove('active');
}

// 加载最近记录
function loadRecentRecords() {
    const data = getData();
    const recentRecordsList = document.getElementById('recent-records-list');
    
    // 安全地获取records数组
    let records = [];
    try {
        records = Array.isArray(data && data.records) ? data.records : [];
    } catch (e) {
        console.error('获取记录数据失败:', e);
        records = [];
    }
    
    // 安全地排序和截取
    let recentRecords = [];
    try {
        recentRecords = [...records].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0)).slice(0, 5);
    } catch (e) {
        console.error('处理记录数据失败:', e);
        recentRecords = [];
    }
    
    if (recentRecords.length === 0) {
        recentRecordsList.innerHTML = `
            <div class="empty-state">
                <p>暂无记录，点击下方按钮开始记录</p>
            </div>
        `;
        return;
    }
    
    recentRecordsList.innerHTML = '';
    
    recentRecords.forEach(record => {
        const recordItem = document.createElement('div');
        recordItem.className = 'record-item';
        
        const typeIcon = getRecordTypeIcon(record.type);
        const typeLabel = getRecordTypeLabel(record.type);
        const formattedTime = formatTime(record.timestamp);
        const additionalInfo = getRecordAdditionalInfo(record);
        
        recordItem.innerHTML = `
            <div class="record-content">
                <div class="record-title">${typeIcon} ${typeLabel}</div>
                <div class="record-time">${formattedTime}</div>
                ${additionalInfo ? `<div class="record-details">${additionalInfo}</div>` : ''}
            </div>
            <div class="record-actions">
                <button class="icon-btn edit-record" data-id="${record.id}">✏️</button>
                <button class="icon-btn delete-record" data-id="${record.id}">🗑️</button>
            </div>
        `;
        
        recentRecordsList.appendChild(recordItem);
    });
    
    // 添加事件监听器
    document.querySelectorAll('.edit-record').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const recordId = e.currentTarget.dataset.id;
            editRecord(recordId);
        });
    });
    
    document.querySelectorAll('.delete-record').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const recordId = e.currentTarget.dataset.id;
            if (confirm('确定要删除这条记录吗？')) {
                deleteRecord(recordId);
            }
        });
    });
}

// 获取记录类型图标
function getRecordTypeIcon(type) {
    const icons = {
        feeding: '🍼',
        drinking: '💧',
        diaper: '🧷',
        sleep: '💤',
        temperature: '🌡️',
        bath: '🛁',
        medicine: '💊'
    };
    return icons[type] || '📝';
}

// 获取记录类型标签
function getRecordTypeLabel(type) {
    const labels = {
        feeding: '喂奶',
        drinking: '喝水',
        diaper: '尿布',
        sleep: '睡眠',
        temperature: '体温',
        bath: '洗澡',
        medicine: '用药'
    };
    return labels[type] || '记录';
}

// 格式化时间
function formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
        return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    } else {
        return date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' }) + ' ' + 
               date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    }
}

// 获取记录附加信息
function getRecordAdditionalInfo(record) {
    switch (record.type) {
        case 'feeding':
            return `${record.amount || '--'} ml · ${record.method || ''}`;
        case 'drinking':
            return `${record.amount || '--'} ml`;
        case 'temperature':
            return `${record.temperature || '--'}°C`;
        case 'sleep':
            if (record.endTime) {
                const duration = Math.round((record.endTime - record.startTime) / 60000);
                return `持续 ${Math.floor(duration / 60)}小时${duration % 60}分钟`;
            }
            return '进行中';
        default:
            return record.notes || '';
    }
}

// 更新统计数据
function updateStats() {
    try {
        const data = getData() || {};
        const records = Array.isArray(data.records) ? data.records : [];
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayTimestamp = today.getTime();
        
        // 使用try-catch包装filter操作
        let todayRecords = [];
        try {
            todayRecords = records.filter(record => {
                try {
                    return record && typeof record === 'object' && 
                           record.timestamp && 
                           record.timestamp >= todayTimestamp;
                } catch (innerError) {
                    return false;
                }
            });
        } catch (e) {
            console.error('筛选今日记录失败:', e);
            todayRecords = [];
        }
        
        // 计算喂奶次数
        const feedCount = todayRecords.filter(record => record && record.type === 'feeding').length;
        const feedCountEl = document.getElementById('feed-count');
        if (feedCountEl) feedCountEl.textContent = feedCount;
        
        // 计算睡眠时长
        let sleepDuration = 0;
        todayRecords.forEach(record => {
            if (record && record.type === 'sleep') {
                if (record.endTime) {
                    sleepDuration += (record.endTime - record.startTime);
                } else {
                    sleepDuration += (Date.now() - record.startTime);
                }
            }
        });
        const sleepHours = Math.round(sleepDuration / (1000 * 60 * 60) * 10) / 10;
        const sleepDurationEl = document.getElementById('sleep-duration');
        if (sleepDurationEl) sleepDurationEl.textContent = `${sleepHours}h`;
        
        // 获取最新体温
        const tempRecords = todayRecords
            .filter(record => record && record.type === 'temperature' && record.temperature)
            .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        const lastTemperature = tempRecords[0]?.temperature || '--.-';
        const lastTemperatureEl = document.getElementById('last-temperature');
        if (lastTemperatureEl) lastTemperatureEl.textContent = `${lastTemperature}°C`;
        
        // 计算洗澡次数
        const bathCount = todayRecords.filter(record => record && record.type === 'bath').length;
        const bathCountEl = document.getElementById('bath-count');
        if (bathCountEl) bathCountEl.textContent = bathCount;
    } catch (e) {
        console.error('更新统计数据失败:', e);
    }
}

// 加载提醒列表
function loadReminders() {
    const data = getData();
    const remindersList = document.getElementById('reminders-list');
    
    if (data.reminders.length === 0) {
        remindersList.innerHTML = `
            <div class="empty-state">
                <p>暂无提醒，点击上方按钮添加</p>
            </div>
        `;
        return;
    }
    
    remindersList.innerHTML = '';
    
    data.reminders.forEach(reminder => {
        const reminderItem = document.createElement('div');
        reminderItem.className = 'reminder-item';
        
        const formattedTime = formatReminderTime(reminder);
        const repeatText = getRepeatText(reminder);
        
        reminderItem.innerHTML = `
            <div class="reminder-content">
                <div class="reminder-title">${reminder.title}</div>
                <div class="reminder-time">${formattedTime} ${repeatText}</div>
            </div>
            <div class="reminder-actions">
                <label class="switch">
                    <input type="checkbox" class="toggle-reminder" data-id="${reminder.id}" ${reminder.enabled ? 'checked' : ''}>
                    <span class="slider"></span>
                </label>
                <button class="icon-btn edit-reminder" data-id="${reminder.id}">✏️</button>
                <button class="icon-btn delete-reminder" data-id="${reminder.id}">🗑️</button>
            </div>
        `;
        
        remindersList.appendChild(reminderItem);
    });
    
    // 添加事件监听器
    document.querySelectorAll('.toggle-reminder').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            const reminderId = e.currentTarget.dataset.id;
            toggleReminder(reminderId, e.currentTarget.checked);
        });
    });
    
    document.querySelectorAll('.edit-reminder').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const reminderId = e.currentTarget.dataset.id;
            editReminder(reminderId);
        });
    });
    
    document.querySelectorAll('.delete-reminder').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const reminderId = e.currentTarget.dataset.id;
            if (confirm('确定要删除这个提醒吗？')) {
                deleteReminder(reminderId);
            }
        });
    });
}

// 格式化提醒时间
function formatReminderTime(reminder) {
    const time = new Date(`2000-01-01T${reminder.time}`);
    return time.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
}

// 获取重复文本
function getRepeatText(reminder) {
    if (!reminder.repeat) return '(仅一次)';
    
    const days = [];
    if (reminder.repeat.monday) days.push('一');
    if (reminder.repeat.tuesday) days.push('二');
    if (reminder.repeat.wednesday) days.push('三');
    if (reminder.repeat.thursday) days.push('四');
    if (reminder.repeat.friday) days.push('五');
    if (reminder.repeat.saturday) days.push('六');
    if (reminder.repeat.sunday) days.push('日');
    
    if (days.length === 7) return '(每天)';
    if (days.length === 5 && days.includes('一') && days.includes('五')) return '(工作日)';
    if (days.length === 2 && days.includes('六') && days.includes('日')) return '(周末)';
    
    return `(周${days.join('、')})`;
}

// 编辑记录
function editRecord(recordId) {
    // 此函数将在records.js中实现
    console.log('Edit record:', recordId);
}

// 删除记录
function deleteRecord(recordId) {
    const data = getData();
    data.records = data.records.filter(record => record.id !== recordId);
    saveData(data);
    loadRecentRecords();
    updateStats();
}

// 切换提醒状态
function toggleReminder(reminderId, enabled) {
    const data = getData();
    const reminder = data.reminders.find(r => r.id === reminderId);
    if (reminder) {
        reminder.enabled = enabled;
        saveData(data);
        // 更新提醒设置
        updateReminderSettings();
    }
}

// 编辑提醒
function editReminder(reminderId) {
    // 此函数将在reminders.js中实现
    console.log('Edit reminder:', reminderId);
}

// 删除提醒
function deleteReminder(reminderId) {
    const data = getData();
    data.reminders = data.reminders.filter(reminder => reminder.id !== reminderId);
    saveData(data);
    loadReminders();
    // 更新提醒设置
    updateReminderSettings();
}

// 更新提醒设置
function updateReminderSettings() {
    // 此函数将在reminders.js中实现
    console.log('Update reminder settings');
}

// 生成唯一ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// 事件监听器
function initEventListeners() {
    // 标签按钮点击事件
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            switchTab(btn.dataset.tab);
        });
    });
    
    // 底部导航点击事件
    bottomNavItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            switchTab(item.dataset.tab);
        });
    });
    
    // 浮动添加按钮点击事件
    floatingAddBtn.addEventListener('click', () => {
        switchTab('records');
    });
    
    // 顶部添加按钮点击事件
    addBtn.addEventListener('click', () => {
        switchTab('records');
    });
    
    // 关闭模态框
    closeModalBtn.addEventListener('click', closeModal);
    
    // 点击模态框背景关闭
    modalContainer.addEventListener('click', (e) => {
        if (e.target === modalContainer) {
            closeModal();
        }
    });
    
    // 添加提醒按钮点击事件
    document.getElementById('add-reminder-btn')?.addEventListener('click', () => {
        // 显示提醒表单
        document.getElementById('reminder-form-container')?.classList.remove('hidden');
    });
}

// 页面加载完成后初始化
window.addEventListener('load', () => {
    initApp();
    initEventListeners();
});