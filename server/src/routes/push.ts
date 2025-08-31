import { Router } from 'express';
import webpush from 'web-push';

const router = Router();

// VAPID keys - in production, these should be environment variables
const vapidKeys = {
  subject: process.env.VAPID_SUBJECT || 'mailto:admin@campuscheers.com',
  publicKey: process.env.VAPID_PUBLIC_KEY || '',
  privateKey: process.env.VAPID_PRIVATE_KEY || ''
};

// Set VAPID details only if keys are properly configured
if (vapidKeys.publicKey && vapidKeys.privateKey && vapidKeys.publicKey !== 'BYourVAPIDPublicKeyHere') {
  webpush.setVapidDetails(
    vapidKeys.subject,
    vapidKeys.publicKey,
    vapidKeys.privateKey
  );
}

// Get VAPID public key for frontend
router.get('/vapid-public-key', (req, res) => {
  res.json({ publicKey: vapidKeys.publicKey });
});

// Subscribe to push notifications
router.post('/subscribe', (req, res) => {
  const subscription = req.body;

  // In a real app, you'd save this subscription to the database
  // associated with the user
  console.log('Push subscription received:', subscription);

  res.status(201).json({ message: 'Subscription saved successfully' });
});

// Unsubscribe from push notifications
router.post('/unsubscribe', (req, res) => {
  const subscription = req.body;

  // In a real app, you'd remove this subscription from the database
  console.log('Push unsubscription received:', subscription);

  res.status(200).json({ message: 'Unsubscription successful' });
});

// Send push notification (for testing)
router.post('/send', async (req, res) => {
  const { subscription, title, body } = req.body;

  const payload = JSON.stringify({
    title: title || 'CampusCheers',
    body: body || 'You have a new notification!'
  });

  try {
    await webpush.sendNotification(subscription, payload);
    res.status(200).json({ message: 'Notification sent successfully' });
  } catch (error) {
    console.error('Error sending notification:', error);
    res.status(500).json({ error: 'Failed to send notification' });
  }
});

// Send Cheers Moment notification to all users in a school
router.post('/cheers-moment/:schoolId', async (req, res) => {
  const { schoolId } = req.params;

  // In a real app, you'd:
  // 1. Get all users from the school
  // 2. Get their push subscriptions from the database
  // 3. Send notifications to each subscription

  const payload = JSON.stringify({
    title: '⚠️ Cheers Moment!',
    body: 'You have 2 minutes to capture your moment!',
    data: {
      type: 'cheers-moment',
      url: '/moment'
    }
  });

  // This is a placeholder - in reality you'd loop through all subscriptions
  res.status(200).json({
    message: `Cheers Moment notifications sent to school ${schoolId}`,
    payload
  });
});

export default router;