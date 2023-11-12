import toast from 'react-hot-toast';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import { Message } from '@/mixins/Message';
import UnseenChatToast from '@/components/UnseenChatToast';

type UseGroupChatUnseenMessagesArgs = {
  userId: string;
};

export const useGroupChatUnseenMessages = ({ userId }: UseGroupChatUnseenMessagesArgs) => {
  const [unseenMessages, setUnseenMessages] = useState<Message[]>([]);

  const pathname = usePathname();

  useEffect(() => {
    if (pathname?.includes('/dashboard/group-chat')) {
      setUnseenMessages((prevMessages) =>
        prevMessages.filter((msg) => msg.groupChatId && !pathname.includes(msg.groupChatId)),
      );
    }
  }, [pathname]);

  const newGroupChatMessageHandler = useCallback(
    (message: Message) => {
      const shouldBeNotified = pathname !== `/dashboard/group-chat/${message.groupChatId}`;

      if (!shouldBeNotified) return;

      toast.custom((t) => (
        <UnseenChatToast
          t={t}
          href={`/dashboard/group-chat/${message.groupChatId}`}
          senderId={message.senderId}
          senderImg={message.senderImage}
          senderMessage={message.text}
          senderName={message.senderName}
          userId={userId}
          isGroupChat
          chatName={message.groupChatName || ''}
        />
      ));

      setUnseenMessages((prevMessages) => [...prevMessages, message]);
    },
    [pathname, userId],
  );

  return {
    unseenMessages,
    newGroupChatMessageHandler,
  };
};
