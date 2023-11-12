import { z } from 'zod';

import { fetchRedis } from '@/helpers/redis';
import { AppUser } from '@/mixins/AppUser';

export async function POST(req: Request) {
  const body = await req.json();

  const { userId } = z.object({ userId: z.string() }).parse(body);

  if (!userId) {
    return new Response('Bad request, no userId provided', { status: 400 });
  }

  const friendsIds: string[] = await fetchRedis('smembers', `user:${userId}:friends`);

  if (!friendsIds.length) {
    return new Response('No friends *sadge*', { status: 404 });
  }

  const friendsRaw: string[] = await fetchRedis('mget', ...friendsIds.map((id) => `user:${id}`));
  const friends: AppUser[] = friendsRaw.map((friend) => JSON.parse(friend));

  return new Response(JSON.stringify(friends));
}
