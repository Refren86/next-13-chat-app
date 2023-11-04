'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

import { chatHrefConstructor, toPusherKey } from '@/lib/utils';
import { pusherClient } from '@/lib/pusher';
import { Message } from '@/lib/validations/message';
import UnseenChatToast from './UnseenChatToast';

type Props = {
  friends: AppUser[];
  sessionId: string;
};

type ExtendedMessage = Message & { senderImage: string; senderName: string };

const SidebarChatList = ({ friends, sessionId }: Props) => {
  const router = useRouter();
  const [unseenMessages, setUnseenMessages] = useState<Message[]>([]);
  const [activeChats, setActiveChats] = useState<AppUser[]>(friends);

  const pathname = usePathname(); // this hook returns the current path (relative)

  useEffect(() => {
    pusherClient.subscribe(toPusherKey(`user:${sessionId}:chats`));
    pusherClient.subscribe(toPusherKey(`user:${sessionId}:friends`));

    const chatHandler = (message: ExtendedMessage) => {
      const shouldBeNotified = pathname !== `/dashboard/chat/${chatHrefConstructor(sessionId, message.senderId)}`;

      if (!shouldBeNotified) return;

      // should be notified
      toast.custom((t) => (
        // custom component
        <UnseenChatToast
          t={t}
          senderId={message.senderId}
          senderImg={message.senderImage}
          senderMessage={message.text}
          senderName={message.senderName}
          sessionId={sessionId}
        />
      ));

      setUnseenMessages(prevMessages => [...prevMessages, message])
    };

    const newFriendHandler = (newFriend: AppUser) => {
      setActiveChats(prevChats => [...prevChats, newFriend])
    };

    pusherClient.bind('new_message', chatHandler);
    pusherClient.bind('new_friend', newFriendHandler);

    return () => {
      pusherClient.unsubscribe(toPusherKey(`user:${sessionId}:chats`));
      pusherClient.unsubscribe(toPusherKey(`user:${sessionId}:friends`));
      pusherClient.unbind('new_message', chatHandler);
      pusherClient.unbind('new_friend', newFriendHandler);
    };
  }, [pathname, sessionId, router]);

  useEffect(() => {
    // if user enters specific chat, sets all messages as read for this chat
    if (pathname?.includes('chat')) {
      setUnseenMessages((prevMessages) => prevMessages.filter((msg) => !pathname.includes(msg.senderId)));
    }
  }, [pathname]);

  return (
    <ul role="list" className="max-h-[25rem] overflow-y-auto -mx-2 space-y-1">
      {activeChats.sort().map((friend) => {
        const unseenMessagesCount = unseenMessages.filter((msg) => msg.senderId === friend.id).length;

        return (
          <li key={friend.id}>
            <a
              href={`/dashboard/chat/${chatHrefConstructor(sessionId, friend.id)}`}
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
  );
};

export default SidebarChatList;
