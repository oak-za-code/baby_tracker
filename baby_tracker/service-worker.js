// 缓存版本，用于更新缓存
const CACHE_VERSION = 'v1.0.0';
const CACHE_NAME = `baby-tracker-${CACHE_VERSION}`;

// 需要缓存的资源列表
const STATIC_ASSETS = [
  '/baby_tracker/index.html',
  '/baby_tracker/css/style.css',
  '/baby_tracker/js/app.js',
  '/baby_tracker/js/dataStorage.js',
  '/baby_tracker/js/records.js',
  '/baby_tracker/js/reminders.js',
  '/baby_tracker/js/music.js',
  '/baby_tracker/manifest.json',
  // 基本图标文件
  '/baby_tracker/images/icon-192.png',
  '/baby_tracker/images/icon-512.png',
  '/baby_tracker/images/icon-180.png',
  // 基本音乐文件
  '/baby_tracker/sounds/lullaby.mp3',
  '/baby_tracker/sounds/rain.mp3',
  '/baby_tracker/sounds/waves.mp3'
];

// 安装Service Worker时缓存静态资源
self.addEventListener('install', (event) => {
  console.log('Service Worker 安装中...');
  
  // 立即激活，不等待旧的Service Worker终止
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('打开缓存');
        // 并行缓存所有资源
        return Promise.all(
          STATIC_ASSETS.map(asset => {
            return fetch(asset)
              .then(response => {
                if (response.ok) {
                  return cache.put(asset, response);
                }
                console.warn(`无法缓存 ${asset}: ${response.status}`);
              })
              .catch(error => {
                console.error(`获取资源失败 ${asset}:`, error);
              });
          })
        );
      })
      .catch(error => {
        console.error('缓存资源失败:', error);
      })
  );
});

// 激活Service Worker时清理旧缓存
self.addEventListener('activate', (event) => {
  console.log('Service Worker 激活中...');
  
  // 立即获取控制权
  event.waitUntil(
    clients.claim().then(() => {
      // 清理旧版本的缓存
      return caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.filter((cacheName) => {
            // 只清理本应用的旧缓存
            return cacheName.startsWith('baby-tracker-') && cacheName !== CACHE_NAME;
          }).map((cacheName) => {
            console.log('删除旧缓存:', cacheName);
            return caches.delete(cacheName);
          })
        );
      });
    })
  );
});

// 处理网络请求
self.addEventListener('fetch', (event) => {
  // 过滤掉非GET请求
  if (event.request.method !== 'GET') return;
  
  // 过滤掉浏览器扩展和Chrome DevTools的请求
  if (!event.request.url.startsWith(self.location.origin)) return;
  
  // 处理不同类型资源的缓存策略
  const url = new URL(event.request.url);
  
  // 缓存优先策略 - 对于静态资源
  if (url.pathname.startsWith('/baby_tracker/css/') ||
      url.pathname.startsWith('/baby_tracker/js/') ||
      url.pathname.startsWith('/baby_tracker/images/') ||
      url.pathname.startsWith('/baby_tracker/manifest.json') ||
      url.pathname.endsWith('/index.html')) {
    event.respondWith(
      caches.match(event.request)
        .then((cachedResponse) => {
          // 如果缓存中有响应，则返回缓存的响应
          if (cachedResponse) {
            // 同时在后台更新缓存
            updateCache(event.request);
            return cachedResponse;
          }
          
          // 如果缓存中没有，则尝试网络请求
          return fetchAndCache(event.request);
        })
        .catch(() => {
          // 离线时，如果是HTML请求，返回缓存的首页
          if (event.request.headers.get('accept')?.includes('text/html')) {
            return caches.match('/baby_tracker/index.html');
          }
        })
    );
  }
  // 网络优先策略 - 对于音乐文件等大型媒体资源
  else if (url.pathname.startsWith('/baby_tracker/sounds/')) {
    event.respondWith(
      fetchAndCacheLargeFile(event.request)
    );
  }
  // 默认策略 - 先尝试网络，失败后返回缓存
  else {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          // 只缓存成功的响应
          if (networkResponse && networkResponse.ok && networkResponse.type === 'basic') {
            // 克隆响应，因为响应流只能使用一次
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // 网络失败时，尝试从缓存获取
          return caches.match(event.request);
        })
    );
  }
});

// 辅助函数：更新缓存
function updateCache(request) {
  return fetch(request)
    .then((response) => {
      if (response.ok) {
        return caches.open(CACHE_NAME).then((cache) => {
          return cache.put(request, response);
        });
      }
    })
    .catch(error => {
      console.error('更新缓存失败:', error);
    });
}

// 辅助函数：获取并缓存资源
function fetchAndCache(request) {
  return fetch(request)
    .then((response) => {
      // 只缓存成功的响应
      if (response && response.ok && response.type === 'basic') {
        // 克隆响应，因为响应流只能使用一次
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseToCache);
        });
      }
      return response;
    });
}

// 辅助函数：获取并缓存大型文件，使用流式处理
function fetchAndCacheLargeFile(request) {
  // 先检查缓存
  return caches.match(request)
    .then((cachedResponse) => {
      if (cachedResponse) {
        // 如果缓存中有，则返回缓存
        return cachedResponse;
      }
      
      // 尝试网络请求
      return fetch(request)
        .then((networkResponse) => {
          // 只缓存成功的响应
          if (networkResponse && networkResponse.ok) {
            // 对于大型媒体文件，我们可以选择不缓存，或者使用Storage API存储
            // 这里为了简化，我们不缓存大型媒体文件，但确保网络请求能正常工作
            return networkResponse;
          }
          throw new Error('Network response was not ok');
        })
        .catch(() => {
          // 网络失败且无缓存时的备用处理
          console.log('无法获取大型媒体文件，返回404');
          return new Response('Media file not available offline', { status: 404 });
        });
    });
}

// 推送通知事件处理
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  try {
    const data = event.data.json();
    const options = {
      body: data.body || '宝宝记录提醒',
      icon: '/baby_tracker/images/icon-192.png',
      badge: '/baby_tracker/images/icon-192.png',
      data: {
        url: data.url || '/baby_tracker/index.html'
      },
      vibrate: [100, 50, 100],
      sound: '/baby_tracker/sounds/reminder.mp3'
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title || '提醒', options)
    );
  } catch (error) {
    console.error('处理推送消息失败:', error);
  }
});

// 通知点击事件处理
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const urlToOpen = event.notification.data?.url || '/baby_tracker/index.html';
  
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      // 检查是否已经有打开的窗口
      for (const client of clientList) {
        if (client.url.includes(urlToOpen) && 'focus' in client) {
          return client.focus();
        }
      }
      // 如果没有打开的窗口，则打开新窗口
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// 后台同步事件处理（用于离线数据同步）
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-records') {
    event.waitUntil(syncRecords());
  }
});

// 模拟数据同步函数
function syncRecords() {
  // 实际应用中，这里可以实现将离线存储的记录同步到服务器
  console.log('执行后台数据同步');
  // 返回一个Promise，表示同步操作
  return Promise.resolve();
}

// 周期性后台同步（需要HTTPS和用户授权）
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'daily-backup') {
    event.waitUntil(performDailyBackup());
  }
});

// 模拟每日备份函数
function performDailyBackup() {
  console.log('执行每日数据备份');
  // 返回一个Promise，表示备份操作
  return Promise.resolve();
}