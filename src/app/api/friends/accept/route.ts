import { z } from 'zod';
import { getServerSession } from 'next-auth';

import { db } from '@/lib/db';
import { authOptions } from '@/lib/auth';
import { fetchRedis } from '@/helpers/redis';
import { pusherServer } from '@/lib/pusher';
import { toPusherKey } from '@/lib/utils';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // parse = validate (if validation fails, throws an error)
    const { id: idToAdd } = z.object({ id: z.string() }).parse(body);

    const session = await getServerSession(authOptions);

    if (!session) {
      return new Response('Unauthorized', { status: 401 });
    }

    // verify both user are not already friends
    const isAlreadyFriends: 0 | 1 = await fetchRedis('sismember', `user:${session.user.id}:friends`, idToAdd);

    if (isAlreadyFriends) {
      return new Response('Already friends', { status: 400 });
    }

    // check if there is a friend request
    const hasFriendRequest: 0 | 1 = await fetchRedis(
      'sismember',
      `user:${session.user.id}:incoming_friend_requests`,
      idToAdd,
    );

    if (!hasFriendRequest) {
      return new Response('Friend request does not exist', { status: 400 });
    }

    const [userRaw, friendRaw]: string[] = await Promise.all([
      fetchRedis('get', `user:${session.user.id}`),
      fetchRedis('get', `user:${idToAdd}`),
    ]);

    const user: AppUser = JSON.parse(userRaw);
    const friend: AppUser = JSON.parse(friendRaw);

    // notify added user (listener in SidebarChatList)

    await Promise.all([
      pusherServer.trigger(toPusherKey(`user:${idToAdd}:friends`), 'new_friend', user),
      pusherServer.trigger(toPusherKey(`user:${session.user.id}:friends`), 'new_friend', friend),
      db.sadd(`user:${session.user.id}:friends`, idToAdd),
      db.sadd(`user:${idToAdd}:friends`, session.user.id),
      // db.srem(`user:${idToAdd}:outbound_friend_requests`, session.user.id); // вихідний реквест (того, хто подавав запит дружби)
      db.srem(`user:${session.user.id}:incoming_friend_requests`, idToAdd),
    ]);

    return new Response('Friend was added');
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response('Invalid request payload', { status: 422 });
    }

    return new Response('Invalid request', { status: 400 });
  }
}
