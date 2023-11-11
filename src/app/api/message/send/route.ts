import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth';
import { fetchRedis } from '@/helpers/redis';
import { db } from '@/lib/db';
import { messageValidator } from '@/lib/validations/message';
import { generateId } from '@/helpers/common';
import { pusherServer } from '@/lib/pusher';
import { toPusherKey } from '@/lib/utils';
import { AppUser } from '@/mixins/AppUser';
import { Message } from '@/mixins/Message';

export async function POST(req: Request) {
  try {
    const { text, chatId }: { text: string; chatId: string } = await req.json();

    const session = await getServerSession(authOptions);

    if (!session) {
      return new Response('Unauthorized', { status: 401 });
    }

    const [userId1, userId2] = chatId.split('--');

    if (session.user.id !== userId1 && session.user.id !== userId2) {
      return new Response('Unauthorized', { status: 401 });
    }

    const friendId = session.user.id === userId1 ? userId2 : userId1;

    const friendList: string[] = await fetchRedis('smembers', `user:${session.user.id}:friends`);
    const isFriend = friendList.includes(friendId);

    if (!isFriend) {
      return new Response('User is not in the friend list', { status: 400 });
    }

    const rawSender: string = await fetchRedis('get', `user:${session.user.id}`);
    const sender: AppUser = JSON.parse(rawSender);
    
    const timestamp = Date.now();

    const messageData: Message = {
      id: generateId(),
      senderId: session.user.id,
      senderImage: session.user.image || '', // TODO: add default user image
      senderName: session.user.name || 'Unknown user',
      text,
      timestamp,
    };

    const message = messageValidator.parse(messageData);

    // notify client about new message
    pusherServer.trigger(toPusherKey(`chat:${chatId}`), 'message_send', message);

    pusherServer.trigger(toPusherKey(`user:${friendId}:chats`), 'new_message', {
      ...message,
      senderImage: sender.image,
      senderName: sender.name,
    });

    // adds to SORTED list(set)
    await db.zadd(`chat:${chatId}:messages`, {
      score: timestamp, // value by which the set will be sorted
      member: message, // actual value of sorted set
    });

    return new Response('opa');
  } catch (error) {
    if (error instanceof Error) {
      return new Response(error.message, { status: 500 });
    }

    return new Response('Internal server error', { status: 500 });
  }
}
