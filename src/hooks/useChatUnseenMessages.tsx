import toast from 'react-hot-toast';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import { Message } from '@/mixins/Message';
import { chatHrefConstructor } from '@/lib/utils';
import UnseenChatToast from '@/components/UnseenChatToast';

type UseChatUnseenMessagesArgs = {
  userId: string;
};

export const useChatUnseenMessages = ({ userId }: UseChatUnseenMessagesArgs) => {
  const [unseenMessages, setUnseenMessages] = useState<Message[]>([]);

  const pathname = usePathname();

  useEffect(() => {
    if (pathname?.includes('/dashboard/chat')) {
      setUnseenMessages((prevMessages) => prevMessages.filter((msg) => !pathname.includes(msg.senderId)));
    }
  }, [pathname]);

  const newChatMessageHandler = useCallback(
    (message: Message) => {
      const shouldBeNotified = pathname !== `/dashboard/chat/${chatHrefConstructor(userId, message.senderId)}`;

      if (!shouldBeNotified) return;

      toast.custom((t) => (
        <UnseenChatToast
          t={t}
          href={`/dashboard/chat/${chatHrefConstructor(userId, message.senderId)}`}
          senderId={message.senderId}
          senderImg={message.senderImage}
          senderMessage={message.text}
          senderName={message.senderName}
          userId={userId}
        />
      ));

      setUnseenMessages((prevMessages) => [...prevMessages, message]);
    },
    [pathname, userId],
  );

  return {
    unseenMessages,
    newChatMessageHandler,
  };
};
