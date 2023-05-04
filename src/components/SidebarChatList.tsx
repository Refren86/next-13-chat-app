'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { chatHrefConstructor } from '@/lib/utils';

type Props = {
  friends: User[];
  sessionId: string;
};

const SidebarChatList = ({ friends, sessionId }: Props) => {
  const router = useRouter();
  const [unseenMessages, setUnseenMessages] = useState<Message[]>([]);

  const pathname = usePathname(); // this hook returns the current path (relative)

  useEffect(() => {
    // if user enters specific chat, sets all messages as read for this chat
    if (pathname?.includes('chat')) {
      setUnseenMessages((prevMessages) => prevMessages.filter((msg) => !pathname.includes(msg.senderId)));
    }
  }, [pathname]);

  return (
    <ul role="list" className="max-h-[25rem] overflow-y-auto -mx-2 space-y-1">
      {friends.sort().map((friend) => {
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
