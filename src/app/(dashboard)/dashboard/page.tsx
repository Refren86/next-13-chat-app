import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth';
import { fetchRedis } from '@/helpers/redis';
import { chatHrefConstructor } from '@/lib/utils';
import { getFriendsByUserId } from '@/helpers/get-friends-by-user-id';
import { Message } from '@/mixins/Message';
import { AppUser } from '@/mixins/AppUser';

const DashboardPage = async () => {
  const session = await getServerSession(authOptions);

  if (!session) notFound();

  const friends = await getFriendsByUserId(session.user.id);

  const friendsWithLastMessage: Awaited<(AppUser & { lastMessage: Message | null })[]> = await Promise.all(
    friends.map(async (friend) => {
      const [lastMessage]: string[] = await fetchRedis(
        'zrange',
        `chat:${chatHrefConstructor(session.user.id, friend.id)}:messages`,
        -1,
        -1,
      );

      return {
        ...friend,
        lastMessage: lastMessage ? (JSON.parse(lastMessage) as Message) : null,
      };
    }),
  );

  // TODO: Add list of recent group chats

  return (
    <div className="container py-12">
      <h2 className="font-bold text-5xl mb-8">Recent chats</h2>
      {friendsWithLastMessage.length === 0 ? (
        <p className="text-sm text-zinc-500">Nothing to show here...</p>
      ) : (
        friendsWithLastMessage.map((friend) => (
          <div key={friend.id} className="relative bg-zinc-50 border border-zinc-200 p-3 rounded-md">
            <div className="absolute right-4 inset-y-0 flex items-center">
              <ChevronRight className="h-7 w-7 text-zinc-400" />
            </div>

            <Link
              href={`/dashboard/chat/${chatHrefConstructor(session.user.id, friend.id)}`}
              className="relative sm:flex"
            >
              <div className="mb-4 flex-shrink-0 sm:mb-0 sm:mr-4">
                <div className="relative h-6 w-6">
                  <Image
                    referrerPolicy="no-referrer"
                    className="rounded-full"
                    alt={`${friend.name} profile picture`}
                    src={friend.image}
                    fill
                  />
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold">{friend.name}</h4>
                {friend?.lastMessage && (
                  <p className="mt-1 max-w-md">
                    <span className="text-zinc-400">
                      {friend?.lastMessage?.senderId === session.user.id
                        ? 'You: '
                        : `${friend.lastMessage?.senderName}: `}
                    </span>
                    {friend?.lastMessage?.text}
                  </p>
                )}
              </div>
            </Link>
          </div>
        ))
      )}
    </div>
  );
};

export default DashboardPage;
