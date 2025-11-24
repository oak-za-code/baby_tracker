// 工具函数模块

// 生成唯一ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// 格式化日期时间
function formatDateTime(timestamp) {
    try {
        const date = new Date(timestamp);
        if (isNaN(date.getTime())) return '无效时间';
        
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        
        return `${year}-${month}-${day} ${hours}:${minutes}`;
    } catch (e) {
        return '无效时间';
    }
}

// 格式化日期
function formatDate(timestamp) {
    try {
        const date = new Date(timestamp);
        if (isNaN(date.getTime())) return '无效日期';
        
        const month = date.getMonth() + 1;
        const day = date.getDate();
        
        return `${month}月${day}日`;
    } catch (e) {
        return '无效日期';
    }
}

// 安全地解析JSON
function safeParseJSON(jsonStr, defaultValue = null) {
    try {
        return JSON.parse(jsonStr);
    } catch (e) {
        console.error('JSON解析失败:', e);
        return defaultValue;
    }
}

// 安全地访问对象属性
function safeGet(obj, path, defaultValue = null) {
    if (!obj || typeof obj !== 'object') return defaultValue;
    
    const keys = path.split('.');
    let result = obj;
    
    for (const key of keys) {
        if (result === null || result === undefined) {
            return defaultValue;
        }
        result = result[key];
    }
    
    return result !== undefined ? result : defaultValue;
}

// 防抖函数
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 节流函数
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}