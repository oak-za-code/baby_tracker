// 数据本地存储功能模块JavaScript

// 本地存储键名
const STORAGE_KEY = 'baby_tracker_data';

// 默认数据结构
const DEFAULT_DATA = {
    records: [],
    reminders: [],
    settings: {
        babyName: '宝宝',
        babyBirthday: '',
        theme: 'light',
        notificationsEnabled: true,
        soundEnabled: true,
        musicVolume: 0.7,
        reminderSound: 'default',
        language: 'zh-CN'
    },
    lastBackup: null
};

// 生成唯一ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

// 获取所有数据
function getData() {
    try {
        const storedData = localStorage.getItem(STORAGE_KEY);
        if (storedData) {
            const parsedData = JSON.parse(storedData);
            // 确保数据结构完整
            return mergeWithDefault(parsedData);
        }
    } catch (error) {
        console.error('读取数据失败:', error);
    }
    
    // 如果没有数据或读取失败，返回默认数据
    return { ...DEFAULT_DATA };
}

// 保存数据到本地存储
function saveData(data) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error('保存数据失败:', error);
        showNotification('数据保存失败，请检查存储空间');
        return false;
    }
}

// 将用户数据与默认数据合并
function mergeWithDefault(userData) {
    const mergedData = { ...DEFAULT_DATA };
    
    // 合并用户记录
    if (Array.isArray(userData.records)) {
        mergedData.records = [...userData.records];
    }
    
    // 合并用户提醒
    if (Array.isArray(userData.reminders)) {
        mergedData.reminders = [...userData.reminders];
    }
    
    // 合并用户设置
    if (typeof userData.settings === 'object' && userData.settings !== null) {
        mergedData.settings = { ...mergedData.settings, ...userData.settings };
    }
    
    // 合并其他字段
    if (userData.lastBackup) {
        mergedData.lastBackup = userData.lastBackup;
    }
    
    return mergedData;
}

// 清除所有数据
function clearAllData() {
    try {
        localStorage.removeItem(STORAGE_KEY);
        return true;
    } catch (error) {
        console.error('清除数据失败:', error);
        return false;
    }
}

// 导出数据为JSON
function exportData() {
    try {
        const data = getData();
        const dataStr = JSON.stringify(data, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        // 创建下载链接
        const exportFileName = `baby_tracker_backup_${new Date().toISOString().slice(0,10)}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileName);
        linkElement.click();
        
        // 更新最后备份时间
        data.lastBackup = new Date().toISOString();
        saveData(data);
        
        return true;
    } catch (error) {
        console.error('导出数据失败:', error);
        return false;
    }
}

// 导入数据
function importData(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (event) => {
            try {
                const importedData = JSON.parse(event.target.result);
                
                // 验证导入数据的有效性
                if (!validateImportData(importedData)) {
                    reject(new Error('无效的数据文件格式'));
                    return;
                }
                
                // 合并导入的数据与现有数据
                const mergedData = mergeImportData(importedData);
                
                // 保存合并后的数据
                if (saveData(mergedData)) {
                    resolve(mergedData);
                } else {
                    reject(new Error('保存导入的数据失败'));
                }
            } catch (error) {
                reject(new Error('解析数据文件失败'));
            }
        };
        
        reader.onerror = () => {
            reject(new Error('读取文件失败'));
        };
        
        reader.readAsText(file);
    });
}

// 验证导入的数据
function validateImportData(data) {
    if (typeof data !== 'object' || data === null) {
        return false;
    }
    
    // 至少需要有records或reminders字段
    if (!Array.isArray(data.records) && !Array.isArray(data.reminders)) {
        return false;
    }
    
    // 如果有记录，验证记录格式
    if (Array.isArray(data.records)) {
        for (const record of data.records) {
            if (typeof record !== 'object' || !record.type || !record.timestamp) {
                return false;
            }
        }
    }
    
    // 如果有提醒，验证提醒格式
    if (Array.isArray(data.reminders)) {
        for (const reminder of data.reminders) {
            if (typeof reminder !== 'object' || !reminder.title || !reminder.time) {
                return false;
            }
        }
    }
    
    return true;
}

// 合并导入的数据
function mergeImportData(importedData) {
    const currentData = getData();
    
    // 如果用户确认要导入所有数据
    if (confirm('导入数据将合并到现有的记录中，确定要继续吗？')) {
        // 合并记录
        if (Array.isArray(importedData.records)) {
            // 确保不重复添加相同的记录
            const currentIds = new Set(currentData.records.map(r => r.id));
            const newRecords = importedData.records.filter(r => !currentIds.has(r.id));
            currentData.records = [...currentData.records, ...newRecords];
        }
        
        // 合并提醒
        if (Array.isArray(importedData.reminders)) {
            // 确保不重复添加相同的提醒
            const currentIds = new Set(currentData.reminders.map(r => r.id));
            const newReminders = importedData.reminders.filter(r => !currentIds.has(r.id));
            currentData.reminders = [...currentData.reminders, ...newReminders];
        }
        
        // 合并设置（可选，询问用户是否要覆盖设置）
        if (importedData.settings && confirm('是否要导入设置？这将覆盖您当前的部分设置。')) {
            currentData.settings = { ...currentData.settings, ...importedData.settings };
        }
        
        // 更新最后备份时间
        currentData.lastBackup = new Date().toISOString();
    }
    
    return currentData;
}

// 获取指定类型的记录（过去N天）
function getRecordsByType(type, days = 7) {
    const data = getData();
    const cutoffTime = Date.now() - (days * 24 * 60 * 60 * 1000);
    
    return data.records
        .filter(record => record.type === type && record.timestamp >= cutoffTime)
        .sort((a, b) => b.timestamp - a.timestamp);
}

// 获取今日记录
function getTodayRecords() {
    const data = getData();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTime = today.getTime();
    
    return data.records
        .filter(record => record.timestamp >= todayTime)
        .sort((a, b) => b.timestamp - a.timestamp);
}

// 删除旧记录（保留指定天数的数据）
function cleanupOldRecords(days = 90) {
    try {
        const data = getData();
        const cutoffTime = Date.now() - (days * 24 * 60 * 60 * 1000);
        
        // 保留最近的记录
        const newRecords = data.records.filter(record => record.timestamp >= cutoffTime);
        const deletedCount = data.records.length - newRecords.length;
        
        if (deletedCount > 0) {
            data.records = newRecords;
            saveData(data);
            console.log(`已清理 ${deletedCount} 条旧记录`);
            return deletedCount;
        }
        
        return 0;
    } catch (error) {
        console.error('清理旧记录失败:', error);
        return -1;
    }
}

// 获取统计数据
function getStatistics(days = 7) {
    const data = getData();
    const cutoffTime = Date.now() - (days * 24 * 60 * 60 * 1000);
    
    // 过滤指定天数内的记录
    const recentRecords = data.records.filter(record => record.timestamp >= cutoffTime);
    
    // 按类型分组
    const recordsByType = recentRecords.reduce((groups, record) => {
        if (!groups[record.type]) {
            groups[record.type] = [];
        }
        groups[record.type].push(record);
        return groups;
    }, {});
    
    // 计算统计数据
    const stats = {
        totalRecords: recentRecords.length,
        recordsByType: {},
        summary: {}
    };
    
    // 计算每种类型的记录数量
    for (const type in recordsByType) {
        stats.recordsByType[type] = recordsByType[type].length;
    }
    
    // 计算汇总信息（针对特定类型）
    
    // 计算今日喂奶总量
    if (recordsByType.feeding) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayTime = today.getTime();
        
        const todayFeedings = recordsByType.feeding.filter(r => r.timestamp >= todayTime);
        const totalFeedAmount = todayFeedings.reduce((sum, feeding) => {
            const amount = parseInt(feeding.amount) || 0;
            return sum + amount;
        }, 0);
        
        stats.summary.todayFeedAmount = totalFeedAmount;
        stats.summary.feedingCount = todayFeedings.length;
    }
    
    // 计算今日尿布更换次数
    if (recordsByType.diaper) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayTime = today.getTime();
        
        const todayDiapers = recordsByType.diaper.filter(r => r.timestamp >= todayTime);
        stats.summary.diaperCount = todayDiapers.length;
    }
    
    // 计算今日睡眠时间
    if (recordsByType.sleep) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayTime = today.getTime();
        
        const todaySleeps = recordsByType.sleep.filter(r => 
            (r.startTime >= todayTime) || 
            (r.startTime < todayTime && r.endTime && r.endTime >= todayTime) ||
            (r.startTime < todayTime && !r.endTime)
        );
        
        let totalSleepMinutes = 0;
        
        todaySleeps.forEach(sleep => {
            const startTime = Math.max(sleep.startTime, todayTime);
            const endTime = sleep.endTime || Date.now();
            const durationMinutes = Math.round((endTime - startTime) / 60000);
            totalSleepMinutes += durationMinutes;
        });
        
        stats.summary.totalSleepMinutes = totalSleepMinutes;
    }
    
    return stats;
}

// 检查存储空间
function checkStorageSpace() {
    try {
        const dataStr = localStorage.getItem(STORAGE_KEY) || '';
        const usedBytes = new Blob([dataStr]).size;
        const totalQuota = 5 * 1024 * 1024; // 5MB (localStorage通常限制为5MB)
        const usedPercentage = Math.round((usedBytes / totalQuota) * 100);
        
        return {
            usedBytes,
            usedMB: (usedBytes / (1024 * 1024)).toFixed(2),
            totalMB: 5,
            usedPercentage
        };
    } catch (error) {
        console.error('检查存储空间失败:', error);
        return null;
    }
}

// 自动备份功能
function scheduleAutoBackup() {
    // 每天备份一次
    const checkBackup = () => {
        const data = getData();
        const now = new Date();
        
        // 如果还没有备份记录，或者距离上次备份超过一天
        if (!data.lastBackup || 
            (now.getTime() - new Date(data.lastBackup).getTime() > 24 * 60 * 60 * 1000)) {
            
            // 创建自动备份
            console.log('执行自动备份');
            
            // 这里可以添加自动备份逻辑
            // 例如：导出数据并通过某种方式保存（实际实现可能需要后端支持）
            
            // 更新最后备份时间
            data.lastBackup = now.toISOString();
            saveData(data);
        }
    };
    
    // 立即检查一次
    checkBackup();
    
    // 然后每小时检查一次
    setInterval(checkBackup, 60 * 60 * 1000);
}

// 初始化存储模块
function initStorage() {
    // 获取现有数据或初始化默认数据
    const data = getData();
    
    // 如果是首次使用，保存默认数据
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (!storedData) {
        saveData(data);
    }
    
    // 安排自动备份
    scheduleAutoBackup();
    
    // 设置定期清理旧数据
    setInterval(() => cleanupOldRecords(90), 24 * 60 * 60 * 1000); // 每天清理一次
}

// 页面加载完成后初始化
window.addEventListener('load', () => {
    initStorage();
});

// 将关键函数暴露给全局作用域，供其他模块使用
window.generateId = generateId;
window.getData = getData;
window.saveData = saveData;
window.clearAllData = clearAllData;
window.exportData = exportData;
window.importData = importData;
window.getRecordsByType = getRecordsByType;
window.getTodayRecords = getTodayRecords;
window.getStatistics = getStatistics;
window.checkStorageSpace = checkStorageSpace;