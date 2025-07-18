// اسم الكاش
const CACHE_NAME = 'mgma-v1';

// الملفات المخزنة
const urlsToCache = [
  '/',
  '/MGMA/index.html',
  '/MGMA/styles.css',
  '/MGMA/school-logo.png',
  '/MGMA/school-image.jpg',
  '/MGMA/manifest.json',
  '/MGMA/icons/icon-192x192.png',
  '/MGMA/icons/icon-512x512.png'
];

// التثبيت
self.addEventListener('install', function (event) {
  console.log('🛠️ Service Worker: تم التثبيت');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .catch(err => console.error('فشل التخزين في الكاش:', err))
  );
  self.skipWaiting();
});

// التفعيل
self.addEventListener('activate', function (event) {
  console.log('✅ Service Worker: تم التفعيل');
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            console.log('🧹 حذف الكاش القديم:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// الاستجابة للطلبات
self.addEventListener('fetch', function (event) {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
      .catch(() => new Response('⚠️ لا يوجد اتصال بالإنترنت'))
  );
});

// التعامل مع Push Notifications
self.addEventListener('push', function (event) {
  console.log('📩 تم استقبال Push Notification');
  let data = {};

  try {
    data = event.data.json();
  } catch (e) {
    console.error('📛 خطأ في قراءة البيانات:', e);
    data = {
      title: 'إشعار جديد',
      body: 'لديك إشعار جديد من الموقع.',
      icon: '/MGMA/icons/icon-192x192.png'
    };
  }

  const title = data.title || '📢 إشعار من المجمع';
  const options = {
    body: data.body || 'وصل إشعار جديد!',
    icon: data.icon || '/MGMA/icons/icon-192x192.png',
    data: data.url || '/'
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// عند النقر على الإشعار
self.addEventListener('notificationclick', function (event) {
  console.log('🔔 تم النقر على الإشعار');
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
      for (let client of windowClients) {
        if ('focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(event.notification.data || '/');
      }
    })
  );
});
