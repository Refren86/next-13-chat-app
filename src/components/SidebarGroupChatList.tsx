'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

import { toPusherKey } from '@/lib/utils';
import { pusherClient } from '@/lib/pusher';
import useActiveGroupChats from '@/hooks/useActiveGroupChats';
import { useGroupChatUnseenMessages } from '@/hooks/useGroupChatUnseenMessages';

type Props = {
  groupChats: GroupChat[];
  userId: string;
};

const SidebarGroupChatList = ({ groupChats, userId }: Props) => {
  const router = useRouter();

  const { activeChats, groupChatInvitationHandler } = useActiveGroupChats({ groupChats, userId });
  const { unseenMessages, newGroupChatMessageHandler } = useGroupChatUnseenMessages({ userId });

  const pathname = usePathname();

  useEffect(() => {
    pusherClient.subscribe(toPusherKey(`user:${userId}:group_chat_invite`));

    groupChats.forEach((groupChat) => {
      pusherClient.subscribe(toPusherKey(`group-chat:${groupChat.id}:messages`));
    });

    pusherClient.bind('chat_invite', groupChatInvitationHandler);
    pusherClient.bind('new_group_message', newGroupChatMessageHandler);

    return () => {
      pusherClient.unsubscribe(toPusherKey(`user:${userId}:group_chat_invite`));
      groupChats.forEach((groupChat) => {
        pusherClient.unsubscribe(toPusherKey(`group-chat:${groupChat.id}:messages`));
      });
      pusherClient.unbind('chat_invite', groupChatInvitationHandler);
      pusherClient.unbind('new_group_message', newGroupChatMessageHandler);
    };
  }, [pathname, userId, router, groupChats, groupChatInvitationHandler, newGroupChatMessageHandler]);

  return (
    <>
      {groupChats?.length > 0 && <div className="text-xs font-semibold leading-6 text-gray-400">Group chats:</div>}
      <ul role="list" className="max-h-[25rem] overflow-y-auto -mx-2 space-y-1">
        {activeChats.sort().map((chat) => {
          const unseenMessagesCount = unseenMessages.filter((msg) => msg.groupChatId === chat.id).length;

          return (
            <li key={chat.id}>
              <a
                href={`/dashboard/group-chat/${chat.id}`}
                className="text-gray-700 hover:text-indigo-600 hover:bg-gray-50 group flex items-center gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
              >
                {chat.chatName}
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

export default SidebarGroupChatList;
