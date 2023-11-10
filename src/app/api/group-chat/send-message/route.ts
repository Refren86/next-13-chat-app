import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { groupChatMessageValidator } from '@/lib/validations/message';
import { generateId } from '@/helpers/common';
import { pusherServer } from '@/lib/pusher';
import { toPusherKey } from '@/lib/utils';
import { getGroupChatByKey } from '@/helpers/get-group-chat-by-key';
import { Message } from '@/mixins/Message';

export async function POST(req: Request) {
  try {
    const { text, groupChatId }: { text: string; groupChatId: string } = await req.json();

    const session = await getServerSession(authOptions);

    if (!session) {
      return new Response('Unauthorized', { status: 401 });
    }

    const groupChatInfo = await getGroupChatByKey(`group_chat:${groupChatId}`);

    // handle case when chat does not exist

    const timestamp = Date.now();

    const messageData: Message = {
      id: generateId(),
      groupChatId,
      groupChatName: groupChatInfo.chatName,
      senderId: session.user.id,
      senderImage: session.user.image || '', // TODO: add default user image
      senderName: session.user.name || '',
      text,
      timestamp,
    };

    const message = groupChatMessageValidator.parse(messageData);

    // notify client about new message
    pusherServer.trigger(toPusherKey(`group-chat:${groupChatId}`), 'message_send', message); // TODO: use this!

    // all chat members should be notified
    pusherServer.trigger(toPusherKey(`group-chat:${groupChatId}:messages`), 'new_group_message', {
      ...message,
      senderImage: session.user.image,
      senderName: session.user.name,
    });

    // adds to SORTED list(set)
    await db.zadd(`group-chat:${groupChatId}:messages`, {
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
