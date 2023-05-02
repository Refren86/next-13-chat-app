import { z } from 'zod';
import { getServerSession } from 'next-auth';

import { db } from '@/lib/db';
import { authOptions } from '@/lib/auth';
import { fetchRedis } from '@/helpers/redis';
import { addFriendValidator } from '@/lib/validations/add-friend';

export async function POST(req: Request) {
  try {
    const body = await req.json(); // getting access to body object in new next.js version
    const { email: emailToAdd } = addFriendValidator.parse(body.email);

    // getting user id from upstash db
    const idToAdd: Awaited<string | null> = await fetchRedis('get', `user:email:${emailToAdd}`);

    if (!idToAdd) {
      return new Response('User does not exist', { status: 400 });
    }

    const session = await getServerSession(authOptions);

    if (!session) {
      return new Response('Unauthorized', { status: 401 });
    }

    if (idToAdd === session.user.id) {
      return new Response('You cannot add yourself as a friend', { status: 400 });
    }

    // check if current user is in the list of friend requests of target user
    const hasFriendRequest = (await fetchRedis(
      'sismember',
      `user:${idToAdd}:incoming_friend_requests`,
      session.user.id,
    )) as 0 | 1;

    if (hasFriendRequest) {
      return new Response('Friend request was already requested', { status: 400 });
    }

    // check if user already is a friend
    const isAlreadyFriends = (await fetchRedis('sismember', `user:${session.user.id}:friends`, idToAdd)) as 0 | 1;

    if (isAlreadyFriends) {
      return new Response('Friend is already added', { status: 400 });
    }

    // send friend request if all checks succeeded (add to target user friend request the current user)
    db.sadd(`user:${idToAdd}:incoming_friend_requests`, session.user.id);

    return new Response('Request was sent');
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return new Response('Invalid request body', { status: 422 }); // unprocessable entity (body validation failed)
    }

    return new Response('Invalid request: ' + error?.message, { status: 400 });
  }
}
