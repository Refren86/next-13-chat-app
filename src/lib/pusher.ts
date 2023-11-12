import PusherServer from 'pusher';
import PusherClient from 'pusher-js';

function getPusherCredentials() {
  const appId = process.env.PUSHER_APP_ID;
  const key = process.env.NEXT_PUBLIC_PUSHER_APP_KEY;
  const secret = process.env.PUSHER_APP_SECRET;

  console.log('NEXT_PUBLIC_PUSHER_APP_ID', appId);
  console.log('NEXT_PUBLIC_PUSHER_APP_KEY', key);
  console.log('NEXT_PUBLIC_PUSHER_APP_SECRET', secret);

  if (!appId) {
    throw new Error('Missing pusher appId');
  }

  if (!key) {
    throw new Error('Missing pusher key');
  }

  if (!secret) {
    throw new Error('Missing pusher secret');
  }

  return {
    appId,
    key,
    secret,
  };
}

export const pusherServer = new PusherServer({
  ...getPusherCredentials(),
  cluster: 'eu',
  useTLS: true, // encrypted data traffic (probably)
});

export const pusherClient = new PusherClient(process.env.NEXT_PUBLIC_PUSHER_APP_KEY!, {
  cluster: 'eu',
});
