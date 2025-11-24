// 提醒功能模块JavaScript

// DOM元素
const reminderForm = document.getElementById('reminder-form');
const reminderTitle = document.getElementById('reminder-title');
const reminderTime = document.getElementById('reminder-time');
const reminderRepeat = document.getElementById('reminder-repeat');
const reminderType = document.getElementById('reminder-type');
const remindersList = document.getElementById('reminders-list');

// 提醒类型选项
const reminderTypes = [
    { value: 'feeding', label: '喂奶提醒' },
    { value: 'drinking', label: '喝水提醒' },
    { value: 'diaper', label: '换尿布提醒' },
    { value: 'sleep', label: '睡眠提醒' },
    { value: 'temperature', label: '体温检测提醒' },
    { value: 'medicine', label: '用药提醒' },
    { value: 'bath', label: '洗澡提醒' },
    { value: 'other', label: '其他提醒' }
];

// 重复选项
const repeatOptions = [
    { value: 'once', label: '仅一次' },
    { value: 'daily', label: '每天' },
    { value: 'weekly', label: '每周' },
    { value: 'biweekly', label: '每两周' },
    { value: 'monthly', label: '每月' }
];

// 初始化提醒功能
function initReminders() {
    // 填充提醒类型选项
    populateReminderTypes();
    // 填充重复选项
    populateRepeatOptions();
    // 设置默认时间为当前时间
    setDefaultTime();
    // 加载已保存的提醒
    loadReminders();
    // 初始化通知系统
    initNotificationSystem();
}

// 填充提醒类型选项
function populateReminderTypes() {
    reminderTypes.forEach(type => {
        const option = document.createElement('option');
        option.value = type.value;
        option.textContent = type.label;
        reminderType.appendChild(option);
    });
}

// 填充重复选项
function populateRepeatOptions() {
    repeatOptions.forEach(option => {
        const opt = document.createElement('option');
        opt.value = option.value;
        opt.textContent = option.label;
        reminderRepeat.appendChild(opt);
    });
}

// 设置默认时间为当前时间
function setDefaultTime() {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 1); // 设置为1分钟后，便于测试
    reminderTime.value = formatDateTimeLocal(now);
}

// 处理提醒表单提交
function handleReminderSubmit(e) {
    e.preventDefault();
    
    // 获取表单数据
    const title = reminderTitle.value;
    const time = new Date(reminderTime.value);
    const repeat = reminderRepeat.value;
    const type = reminderType.value;
    
    // 验证表单
    if (!title) {
        alert('请输入提醒标题');
        reminderTitle.focus();
        return;
    }
    
    if (isNaN(time.getTime())) {
        alert('请选择有效时间');
        reminderTime.focus();
        return;
    }
    
    // 创建提醒对象
    const reminder = {
        id: generateId(),
        title,
        time: time.getTime(),
        repeat,
        type,
        active: true,
        createdAt: Date.now()
    };
    
    // 保存提醒
    saveReminder(reminder);
    
    // 重置表单
    reminderForm.reset();
    setDefaultTime();
    
    // 重新加载提醒列表
    loadReminders();
    
    // 显示成功消息
    showNotification('提醒已设置成功！');
}

// 保存提醒
function saveReminder(reminder) {
    const data = getData();
    data.reminders.push(reminder);
    saveData(data);
    
    // 如果提醒是活动的，安排通知
    if (reminder.active) {
        scheduleNotification(reminder);
    }
}

// 加载提醒列表
function loadReminders() {
    const data = getData();
    
    // 如果没有提醒，显示空状态
    if (data.reminders.length === 0) {
        remindersList.innerHTML = `
            <div class="empty-state">
                <p>暂无提醒</p>
                <p class="empty-hint">添加一个新提醒来帮助您记住重要事项</p>
            </div>
        `;
        return;
    }
    
    // 清空列表
    remindersList.innerHTML = '';
    
    // 按时间排序提醒
    const sortedReminders = [...data.reminders].sort((a, b) => a.time - b.time);
    
    // 添加每个提醒到列表
    sortedReminders.forEach(reminder => {
        const reminderItem = createReminderItem(reminder);
        remindersList.appendChild(reminderItem);
    });
}

// 创建提醒列表项
function createReminderItem(reminder) {
    const item = document.createElement('div');
    item.className = `reminder-item ${reminder.active ? '' : 'inactive'}`;
    
    const reminderDate = new Date(reminder.time);
    const formattedTime = reminderDate.toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit'
    });
    const formattedDate = reminderDate.toLocaleDateString('zh-CN', {
        month: 'short',
        day: 'numeric'
    });
    const repeatText = getRepeatText(reminder.repeat);
    const typeText = getReminderTypeLabel(reminder.type);
    
    item.innerHTML = `
        <div class="reminder-header">
            <h4>${reminder.title}</h4>
            <label class="switch">
                <input type="checkbox" class="reminder-toggle" data-id="${reminder.id}" ${reminder.active ? 'checked' : ''}>
                <span class="slider round"></span>
            </label>
        </div>
        <div class="reminder-details">
            <div class="reminder-time">
                <span class="time">${formattedTime}</span>
                <span class="date">${formattedDate}</span>
            </div>
            <div class="reminder-info">
                <span class="type">${typeText}</span>
                <span class="repeat">${repeatText}</span>
            </div>
        </div>
        <div class="reminder-actions">
            <button class="icon-btn edit-reminder" data-id="${reminder.id}">✏️</button>
            <button class="icon-btn delete-reminder" data-id="${reminder.id}">🗑️</button>
        </div>
    `;
    
    return item;
}

// 获取重复选项文本
function getRepeatText(repeat) {
    const texts = {
        once: '仅一次',
        daily: '每天',
        weekly: '每周',
        biweekly: '每两周',
        monthly: '每月'
    };
    return texts[repeat] || '未知';
}

// 获取提醒类型标签
function getReminderTypeLabel(type) {
    const typeObj = reminderTypes.find(t => t.value === type);
    return typeObj ? typeObj.label : '未知类型';
}

// 启用/禁用提醒
function toggleReminder(id, active) {
    const data = getData();
    const reminderIndex = data.reminders.findIndex(r => r.id === id);
    
    if (reminderIndex !== -1) {
        data.reminders[reminderIndex].active = active;
        saveData(data);
        
        // 根据状态安排或取消通知
        if (active) {
            scheduleNotification(data.reminders[reminderIndex]);
        } else {
            cancelNotification(id);
        }
        
        // 更新UI
        loadReminders();
    }
}

// 编辑提醒
function editReminder(id) {
    const data = getData();
    const reminder = data.reminders.find(r => r.id === id);
    
    if (!reminder) return;
    
    // 填充表单
    reminderTitle.value = reminder.title;
    reminderTime.value = formatDateTimeLocal(new Date(reminder.time));
    reminderRepeat.value = reminder.repeat;
    reminderType.value = reminder.type;
    
    // 添加一个隐藏字段来存储ID
    let idInput = reminderForm.querySelector('input[name="reminder-id"]');
    if (!idInput) {
        idInput = document.createElement('input');
        idInput.type = 'hidden';
        idInput.name = 'reminder-id';
        reminderForm.appendChild(idInput);
    }
    idInput.value = id;
    
    // 滚动到表单
    reminderForm.scrollIntoView({ behavior: 'smooth' });
}

// 删除提醒
function deleteReminder(id) {
    if (confirm('确定要删除这个提醒吗？')) {
        const data = getData();
        const filteredReminders = data.reminders.filter(r => r.id !== id);
        data.reminders = filteredReminders;
        saveData(data);
        
        // 取消相关通知
        cancelNotification(id);
        
        // 更新UI
        loadReminders();
    }
}

// 初始化通知系统
function initNotificationSystem() {
    // 请求通知权限
    requestNotificationPermission();
    
    // 检查是否有过期未触发的提醒
    checkDueReminders();
    
    // 设置定时器定期检查提醒
    setInterval(checkDueReminders, 60000); // 每分钟检查一次
}

// 请求通知权限
function requestNotificationPermission() {
    if ('Notification' in window) {
        Notification.requestPermission();
    }
}

// 检查到期提醒
function checkDueReminders() {
    const now = Date.now();
    const data = getData();
    
    data.reminders.forEach(reminder => {
        // 只检查激活的提醒
        if (!reminder.active) return;
        
        // 如果提醒时间已到或过了
        if (reminder.time <= now) {
            // 显示通知
            showReminderNotification(reminder);
            
            // 处理重复提醒
            if (reminder.repeat !== 'once') {
                rescheduleRepeatingReminder(reminder);
            } else {
                // 对于一次性提醒，将其设为非活动状态
                reminder.active = false;
            }
            
            saveData(data);
        }
    });
    
    // 更新UI
    loadReminders();
}

// 显示提醒通知
function showReminderNotification(reminder) {
    if ('Notification' in window && Notification.permission === 'granted') {
        // 创建通知
        const notification = new Notification(reminder.title, {
            body: getReminderTypeLabel(reminder.type),
            icon: '/images/icon-192x192.png',
            vibrate: [200, 100, 200]
        });
        
        // 点击通知打开应用
        notification.onclick = () => {
            window.focus();
            notification.close();
        };
    } else {
        // 如果通知不可用，显示一个浏览器提醒
        alert(`提醒: ${reminder.title}`);
    }
    
    // 播放声音提醒
    playReminderSound();
}

// 安排重复提醒
function rescheduleRepeatingReminder(reminder) {
    const now = new Date();
    let nextDate = new Date(reminder.time);
    
    // 根据重复类型计算下一次提醒时间
    switch (reminder.repeat) {
        case 'daily':
            nextDate.setDate(nextDate.getDate() + 1);
            break;
        case 'weekly':
            nextDate.setDate(nextDate.getDate() + 7);
            break;
        case 'biweekly':
            nextDate.setDate(nextDate.getDate() + 14);
            break;
        case 'monthly':
            nextDate.setMonth(nextDate.getMonth() + 1);
            break;
    }
    
    // 更新提醒时间
    reminder.time = nextDate.getTime();
    
    // 如果计算的下一次时间仍然在过去，继续调整
    if (reminder.time <= now.getTime()) {
        rescheduleRepeatingReminder(reminder);
    }
}

// 播放提醒声音
function playReminderSound() {
    // 尝试播放一个简单的提醒声音
    try {
        const audio = new Audio('/sounds/reminder.mp3');
        audio.play().catch(e => console.log('无法播放提醒声音:', e));
    } catch (e) {
        console.log('提醒声音不可用:', e);
    }
}

// 安排通知（在service worker支持的情况下）
function scheduleNotification(reminder) {
    const now = Date.now();
    const delay = reminder.time - now;
    
    // 如果提醒时间已过，不安排
    if (delay <= 0) return;
    
    // 在service worker不支持的情况下，我们依赖checkDueReminders函数
    // 在支持的情况下，可以使用Notification API的showTrigger
    // 这里我们先使用简单的定时器作为后备方案
    setTimeout(() => {
        checkDueReminders();
    }, delay);
}

// 取消通知
function cancelNotification(id) {
    // 在简单实现中，我们只需要标记提醒为非活动状态
    // 更复杂的实现可能需要取消service worker中的通知
}

// 事件监听器
function initRemindersEventListeners() {
    // 表单提交事件
    if (reminderForm) {
        reminderForm.addEventListener('submit', handleReminderSubmit);
    }
    
    // 动态添加的元素事件委托
    remindersList.addEventListener('click', (e) => {
        const target = e.target;
        
        // 切换提醒开关
        if (target.classList.contains('reminder-toggle') || target.closest('.reminder-toggle')) {
            const checkbox = target.classList.contains('reminder-toggle') ? target : target.closest('.reminder-toggle');
            const id = checkbox.dataset.id;
            toggleReminder(id, checkbox.checked);
        }
        
        // 编辑提醒
        else if (target.classList.contains('edit-reminder') || target.closest('.edit-reminder')) {
            const btn = target.classList.contains('edit-reminder') ? target : target.closest('.edit-reminder');
            const id = btn.dataset.id;
            editReminder(id);
        }
        
        // 删除提醒
        else if (target.classList.contains('delete-reminder') || target.closest('.delete-reminder')) {
            const btn = target.classList.contains('delete-reminder') ? target : target.closest('.delete-reminder');
            const id = btn.dataset.id;
            deleteReminder(id);
        }
    });
}

// 页面加载完成后初始化
window.addEventListener('load', () => {
    initReminders();
    initRemindersEventListeners();
});