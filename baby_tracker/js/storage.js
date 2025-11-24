// 存储管理模块

const STORAGE_KEY = 'babyTrackerData';

// 默认应用数据
const DEFAULT_DATA = {
    settings: {
        babyName: '宝宝',
        theme: 'light',
        soundEnabled: true,
        vibrationEnabled: true
    },
    records: [],
    reminders: [],
    lastUpdated: Date.now()
};

// 获取应用数据
function getData() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) {
            // 如果没有存储数据，返回默认数据
            return DEFAULT_DATA;
        }
        
        const parsed = JSON.parse(stored);
        // 合并默认数据和存储的数据，确保结构完整
        return {
            ...DEFAULT_DATA,
            ...parsed,
            settings: {
                ...DEFAULT_DATA.settings,
                ...(parsed.settings || {})
            },
            records: Array.isArray(parsed.records) ? parsed.records : DEFAULT_DATA.records,
            reminders: Array.isArray(parsed.reminders) ? parsed.reminders : DEFAULT_DATA.reminders
        };
    } catch (e) {
        console.error('读取存储数据失败:', e);
        // 出错时返回默认数据
        return DEFAULT_DATA;
    }
}

// 保存应用数据
function saveData(data) {
    try {
        // 确保数据结构完整
        const dataToSave = {
            ...DEFAULT_DATA,
            ...(data || {}),
            lastUpdated: Date.now()
        };
        
        // 验证并清理records数组
        if (Array.isArray(dataToSave.records)) {
            dataToSave.records = dataToSave.records.filter(record => 
                record && typeof record === 'object' && 
                record.id && record.type && record.timestamp
            );
        } else {
            dataToSave.records = [];
        }
        
        // 验证并清理reminders数组
        if (Array.isArray(dataToSave.reminders)) {
            dataToSave.reminders = dataToSave.reminders.filter(reminder => 
                reminder && typeof reminder === 'object' && 
                reminder.id && reminder.title && reminder.time
            );
        } else {
            dataToSave.reminders = [];
        }
        
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
        return true;
    } catch (e) {
        console.error('保存数据失败:', e);
        return false;
    }
}

// 清除所有数据
function clearData() {
    try {
        localStorage.removeItem(STORAGE_KEY);
        return true;
    } catch (e) {
        console.error('清除数据失败:', e);
        return false;
    }
}

// 获取指定类型的数据
function getRecordsByType(type) {
    try {
        const data = getData();
        return data.records.filter(record => 
            record && record.type === type
        );
    } catch (e) {
        console.error('获取指定类型记录失败:', e);
        return [];
    }
}

// 添加单条记录
function addRecord(record) {
    try {
        const data = getData();
        if (!record || typeof record !== 'object') {
            throw new Error('无效的记录数据');
        }
        
        // 确保记录有必要的属性
        const newRecord = {
            id: record.id || Date.now().toString(),
            type: record.type,
            timestamp: record.timestamp || Date.now(),
            ...record
        };
        
        data.records.push(newRecord);
        return saveData(data);
    } catch (e) {
        console.error('添加记录失败:', e);
        return false;
    }
}

// 添加提醒
function addReminder(reminder) {
    try {
        const data = getData();
        if (!reminder || typeof reminder !== 'object') {
            throw new Error('无效的提醒数据');
        }
        
        // 确保提醒有必要的属性
        const newReminder = {
            id: reminder.id || Date.now().toString(),
            title: reminder.title,
            time: reminder.time,
            enabled: reminder.enabled !== false,
            ...reminder
        };
        
        data.reminders.push(newReminder);
        return saveData(data);
    } catch (e) {
        console.error('添加提醒失败:', e);
        return false;
    }
}

// 删除提醒
function deleteReminder(reminderId) {
    try {
        const data = getData();
        data.reminders = data.reminders.filter(reminder => 
            reminder && reminder.id !== reminderId
        );
        return saveData(data);
    } catch (e) {
        console.error('删除提醒失败:', e);
        return false;
    }
}