self.addEventListener('push', event => {
  let data = {};
  if (event.data) {
    data = event.data.json();
  }
  const title = data.notification?.title || 'Butterfly owo';
  const options = {
    body: data.notification?.body || '',
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(clients.openWindow('/'));
});
