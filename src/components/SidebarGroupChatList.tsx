'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

import { toPusherKey } from '@/lib/utils';
import { pusherClient } from '@/lib/pusher';
import { Message } from '@/lib/validations/message';
import UnseenChatToast from './UnseenChatToast';

type Props = {
  groupChats: GroupChat[];
  userId: string;
};

type ExtendedMessage = Message & { senderImage: string; senderName: string; chatId: string }; // TODO: create mixin for this

const SidebarGroupChatList = ({ groupChats, userId }: Props) => {
  const router = useRouter();
  const [unseenMessages, setUnseenMessages] = useState<Message[]>([]);
  const [activeChats, setActiveChats] = useState<GroupChat[]>(groupChats);

  const pathname = usePathname(); // this hook returns the current path (relative)

  useEffect(() => {
    pusherClient.subscribe(toPusherKey(`user:${userId}:group_chat_invite`));

    groupChats.forEach((groupChat) => {
      pusherClient.subscribe(toPusherKey(`group-chat:${groupChat.id}:messages`));
    });

    const chatInvitationHandler = (chatInvitation: GroupChat) => {
      toast.custom((t) => (
        <UnseenChatToast
          t={t}
          senderId={chatInvitation.id}
          senderImg={chatInvitation.creator.image}
          senderMessage={`Has invited you to a group chat ${chatInvitation.chatName}`}
          senderName={chatInvitation.creator.name}
          userId={userId}
        />
      ));

      setActiveChats((prevChats) => [...prevChats, chatInvitation]);
    };

    const chatHandler = (message: ExtendedMessage) => {
      const shouldBeNotified = pathname !== `/dashboard/group-chat/${message.chatId}`;

      if (!shouldBeNotified) return;

      toast.custom((t) => (
        <UnseenChatToast
          t={t}
          senderId={message.senderId}
          senderImg={message.senderImage}
          senderMessage={message.text}
          senderName={message.chatName || ""}
          userId={userId}
        />
      ));

      setUnseenMessages((prevMessages) => [...prevMessages, message]);
    };

    pusherClient.bind('chat_invite', chatInvitationHandler);
    pusherClient.bind('new_group_message', chatHandler);

    return () => {
      pusherClient.unsubscribe(toPusherKey(`user:${userId}:group_chat_invite`));
      groupChats.forEach((groupChat) => {
        pusherClient.unsubscribe(toPusherKey(`group-chat:${groupChat.id}:messages`));
      });
      pusherClient.unbind('chat_invite', chatInvitationHandler);
      pusherClient.unbind('new_group_message', chatInvitationHandler);
    };
  }, [pathname, userId, router]);

  useEffect(() => {
    // if user enters specific chat, sets all messages as read for this chat
    if (pathname?.includes('group-chat')) {
      setUnseenMessages((prevMessages) => prevMessages.filter((msg) => msg.chatId && !pathname.includes(msg.chatId)));
    }
  }, [pathname]);

  return (
    <ul role="list" className="max-h-[25rem] overflow-y-auto -mx-2 space-y-1">
      {activeChats.sort().map((chat) => {
        const unseenMessagesCount = unseenMessages.filter((msg) => msg.chatId === chat.id).length;

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
  );
};

export default SidebarGroupChatList;
