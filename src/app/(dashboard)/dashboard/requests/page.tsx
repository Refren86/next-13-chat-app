import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth';
import { fetchRedis } from '@/helpers/redis';

const page = async () => {
  const session = await getServerSession(authOptions);

  if (!session) {
    notFound();
  }

  // ids of people who sent current logged in user a friend request
  const incomingSenderIds: string[] = await fetchRedis(
    'smembers',
    `user:${session.user.id}:incoming_friend_requests`,
  );

  const incomingFriendRequests = await Promise.all(
    incomingSenderIds.map(async (requesterId) => {
      const requester: User = await fetchRedis('get', `user:${requesterId}`);
      return { requesterId, requesterEmail: requester.email };
    }),
  );

  console.log(`incomingSenderIds >>>`, incomingSenderIds);

  return (
    <section className="pt-8">
      <h2 className="font-bold text-5xl mb-8">Add a friend</h2>
      <div className='flex flex-col gap-4'>
        {/* <FriendRequests /> */}
      </div>
    </section>
  );
};

export default page;
