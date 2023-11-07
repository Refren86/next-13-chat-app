import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth';
import { fetchRedis } from '@/helpers/redis';
import { db } from '@/lib/db';
import { Message, messageValidator } from '@/lib/validations/message';
import { generateId } from '@/helpers/common';
import { pusherServer } from '@/lib/pusher';
import { toPusherKey } from '@/lib/utils';
import { getGroupChatByKey } from '@/helpers/get-group-chat-by-key';

export async function POST(req: Request) {
  try {
    const { text, chatId }: { text: string; chatId: string } = await req.json();

    const session = await getServerSession(authOptions);

    if (!session) {
      return new Response('Unauthorized', { status: 401 });
    }

    const groupChatInfo = await getGroupChatByKey(`group_chat:${chatId}`);

    // handle case when chat does not exist

    const timestamp = Date.now();

    const messageData: Message = {
      id: generateId(),
      chatId,
      chatName: groupChatInfo.chatName,
      senderId: session.user.id,
      senderImage: session.user.image || '', // TODO: add default user image
      text,
      timestamp,
    };

    const message = messageValidator.parse(messageData);

    // notify client about new message
    pusherServer.trigger(toPusherKey(`group-chat:${chatId}`), 'message_send', message); // TODO: use this!

    // all chat members should be notified
    pusherServer.trigger(toPusherKey(`group-chat:${chatId}:messages`), 'new_group_message', {
      ...message,
      senderImage: session.user.image,
      senderName: session.user.name,
    });

    // adds to SORTED list(set)
    await db.zadd(`group-chat:${chatId}:messages`, {
      score: timestamp, // value by which the set will be sorted
      member: message, // actual value of sorted set
    });

    return new Response(JSON.stringify(messageData));
  } catch (error) {
    if (error instanceof Error) {
      return new Response(error.message, { status: 500 });
    }

    return new Response('Internal server error', { status: 500 });
  }
}
