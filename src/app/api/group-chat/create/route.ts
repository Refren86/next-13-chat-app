import { z } from 'zod';
import { getServerSession } from 'next-auth';

import { db } from '@/lib/db';
import { authOptions } from '@/lib/auth';
import { generateId } from '@/helpers/common';
import { pusherServer } from '@/lib/pusher';
import { toPusherKey } from '@/lib/utils';

export async function POST(req: Request) {
  const body = await req.json();

  const { chatName, userIds } = z.object({ chatName: z.string(), userIds: z.array(z.string()) }).parse(body);

  if (!chatName || !userIds.length) {
    return new Response('Bad request', { status: 400 });
  }

  const session = await getServerSession(authOptions);

  if (!session) {
    return new Response('Unauthorized', { status: 401 });
  }

  const chatId = generateId();
  const chatKey = `group_chat:${chatId}`;
  const { id: userId, name: userName, image: userImage } = session.user;

  const groupChatData = {
    id: chatId,
    chatName,
    creator: {
      id: userId,
      name: userName,
      image: userImage,
    },
    createdAt: Date.now(),
  };

  await Promise.all([
    await db.hset(chatKey, groupChatData),
    await db.sadd(`${chatKey}:members`, userId, ...userIds), // probably should be in hash above
    await db.sadd(`user:${userId}:group_chats`, chatKey),
    ...userIds.map(async (id) => {
      await Promise.all([
        db.sadd(`user:${id}:group_chats`, chatKey),
        pusherServer.trigger(toPusherKey(`user:${id}:group_chat_invite`), 'chat_invite', groupChatData),
      ]);
    }),
  ]);

  return new Response(JSON.stringify({ chatId, chatKey }), { status: 200 });
}
