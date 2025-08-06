// Firebase config hier rein kopieren:
const firebaseConfig = {
  apiKey: "AIzaSyC0OsjwdsdNH8UPtBpIg7xpGZT7vg_b3g0",
  authDomain: "butterfly-47deb.firebaseapp.com",
  projectId: "butterfly-47deb",
  storageBucket: "butterfly-47deb.appspot.com",
  messagingSenderId: "842658093482",
  appId: "1:842658093482:web:5f7b550355e71d888df3d3"
};

// Firebase initialisieren
firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();
const messaging = firebase.messaging();

async function registerServiceWorker() {
  try {
    const registration = await navigator.serviceWorker.register('service-worker.js');
    messaging.useServiceWorker(registration);
    console.log('Service Worker registriert');
  } catch (e) {
    console.error('Service Worker Registrierung fehlgeschlagen:', e);
  }
}

async function requestPermission() {
  try {
    await Notification.requestPermission();
    console.log('Notification permission granted.');
  } catch (e) {
    console.error('Notification permission denied', e);
  }
}

// Login Event
document.getElementById('login-btn').addEventListener('click', async () => {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    const userCred = await auth.signInWithEmailAndPassword(email, password);
    document.getElementById('user-email').innerText = userCred.user.email;
    document.getElementById('auth-section').style.display = 'none';
    document.getElementById('app-section').style.display = 'block';

    await registerServiceWorker();
    await requestPermission();

    // Token holen und speichern
    const token = await messaging.getToken({ vapidKey: 'BMPCTl7boZfKFDvnXBuVp5UPVC4wL2XiOApSxhxn1-INvTkT_2m3pTILpZiEKxYX-1fyHvSehrn3Lo7xh6jMPIw' });
    await db.collection('users').doc(userCred.user.uid).set({
      email,
      token
    });

    console.log('FCM Token gespeichert:', token);

  } catch (err) {
    alert('Fehler: ' + err.message);
  }
});

// Push senden Event
document.getElementById('send-btn').addEventListener('click', async () => {
  const currentUser = auth.currentUser;
  if (!currentUser) return alert('Nicht eingeloggt.');

  // Alle Nutzer holen
  const usersSnapshot = await db.collection('users').get();
  const otherUserDoc = usersSnapshot.docs.find(doc => doc.id !== currentUser.uid);
  if (!otherUserDoc) return alert('Kein anderer Nutzer gefunden.');

  const otherToken = otherUserDoc.data().token;

  // Push via Firebase Cloud Messaging senden
  const serverKey = 'BMPCTl7boZfKFDvnXBuVp5UPVC4wL2XiOApSxhxn1-INvTkT_2m3pTILpZiEKxYX-1fyHvSehrn3Lo7xh6jMPIw';  // Den musst du im Firebase Console holen und hier einfügen

  try {
    await fetch('https://fcm.googleapis.com/fcm/send', {
      method: 'POST',
      headers: {
        Authorization: 'key=' + serverKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        to: otherToken,
        notification: {
          title: 'Ping!',
          body: `${currentUser.email} hat gedrückt!`
        }
      })
    });
    alert('Push gesendet!');
  } catch (e) {
    alert('Push senden fehlgeschlagen: ' + e.message);
  }
});
