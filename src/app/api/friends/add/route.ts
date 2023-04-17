import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth';
import { addFriendValidator } from '@/lib/validations/add-friend';

export async function POST(req: Request) {
  try {
    const body = await req.json(); // getting access to body object in new next.js version
    const { email: emailToAdd } = addFriendValidator.parse(body.email);

    // getting user id from upstash db
    const RESTRes = await fetch(`${process.env.UPSTASH_REDIS_REST_URL}/get/user:email:${emailToAdd}`, {
      headers: { Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}` },
      cache: 'no-store', // will not cache the response
    });

    const data: Awaited<{ result: string | null }> = await RESTRes.json();
    const idToAdd = data.result;

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

    // valid request
    // return new Response(data);
  } catch (error) {}
}
