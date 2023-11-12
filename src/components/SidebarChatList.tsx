'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

import { chatHrefConstructor, toPusherKey } from '@/lib/utils';
import { pusherClient } from '@/lib/pusher';
import { AppUser } from '@/mixins/AppUser';
import { useChatUnseenMessages } from '@/hooks/useChatUnseenMessages';
import useActiveChatsWithUsers from '@/hooks/useActiveChatsWithUsers';

type Props = {
  friends: AppUser[];
  userId: string;
};

const SidebarChatList = ({ friends, userId }: Props) => {
  const router = useRouter();
  const pathname = usePathname();

  const { activeChats, newFriendHandler } = useActiveChatsWithUsers({ friends });
  const { unseenMessages, newChatMessageHandler } = useChatUnseenMessages({ userId });

  useEffect(() => {
    pusherClient.subscribe(toPusherKey(`user:${userId}:chats`));
    pusherClient.subscribe(toPusherKey(`user:${userId}:friends`));

    pusherClient.bind('new_message', newChatMessageHandler);
    pusherClient.bind('new_friend', newFriendHandler);

    return () => {
      pusherClient.unsubscribe(toPusherKey(`user:${userId}:chats`));
      pusherClient.unsubscribe(toPusherKey(`user:${userId}:friends`));
      pusherClient.unbind('new_message', newChatMessageHandler);
      pusherClient.unbind('new_friend', newFriendHandler);
    };
  }, [pathname, userId, router, newFriendHandler, newChatMessageHandler]);

  return (
    <>
      {friends.length > 0 && <div className="text-xs font-semibold leading-6 text-gray-400">Chat with friends:</div>}
      <ul role="list" className="max-h-[25rem] overflow-y-auto -mx-2 space-y-1">
        {activeChats.sort().map((friend) => {
          const unseenMessagesCount = unseenMessages.filter((msg) => msg.senderId === friend.id).length;

          return (
            <li key={friend.id}>
              <a
                href={`/dashboard/chat/${chatHrefConstructor(userId, friend.id)}`}
                className="text-gray-700 hover:text-indigo-600 hover:bg-gray-50 group flex items-center gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
              >
                {friend.name}
                {unseenMessagesCount > 0 && (
                  <div className="bg-indigo-600 font-medium text-xs text-white w-4 h-4 rounded-full grid place-items-center">
                    {unseenMessagesCount}
                  </div>
                )}
              </a>
            </li>
          );
        })}
      </ul>
    </>
  );
};

export default SidebarChatList;
