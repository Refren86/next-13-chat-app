'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

import { cn, toPusherKey } from '@/lib/utils';
import { pusherClient } from '@/lib/pusher';
import { millisecondsToHoursAndMinutes } from '@/helpers/common';
import { Message } from '@/mixins/Message';

type Props = {
  chatId: string;
  userImg: string | null | undefined;
  userId: string;
  initialMessages: Message[];
  isGroupChat?: boolean;
};

const Messages = ({ chatId, initialMessages, userId, userImg, isGroupChat }: Props) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);

  const scrollDownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isGroupChat) {
      pusherClient.subscribe(toPusherKey(`group-chat:${chatId}`));

      const sendMessageHandler = (message: Message) => {
        setMessages((prevMessages) => [message, ...prevMessages]);
      };

      pusherClient.bind('message_send', sendMessageHandler);

      return () => {
        pusherClient.unsubscribe(toPusherKey(`group-chat:${chatId}`));
        pusherClient.unbind('message_send', sendMessageHandler);
      };
    } else {
      pusherClient.subscribe(toPusherKey(`chat:${chatId}`));

      const sendMessageHandler = (message: Message) => {
        setMessages((prevMessages) => [message, ...prevMessages]);
      };

      pusherClient.bind('message_send', sendMessageHandler);

      return () => {
        pusherClient.unsubscribe(toPusherKey(`chat:${chatId}`));
        pusherClient.unbind('message_send', sendMessageHandler);
      };
    }
  }, [chatId, isGroupChat]);

  return (
    <div
      id="messages"
      className="flex h-full flex-1 flex-col-reverse gap-4 p-3 overflow-y-auto scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch"
    >
      <div ref={scrollDownRef} />

      {messages.map((msg, idx) => {
        const isCurrentUser = msg.senderId === userId;
        const hasNextMsgFromSameUser = messages[idx - 1]?.senderId === messages[idx].senderId;

        return (
          <div className="chat-message" key={`${msg.id}-${msg.timestamp}`}>
            <div
              className={cn('flex items-end', {
                'justify-end': isCurrentUser,
              })}
            >
              <div
                className={cn('flex flex-col space-y-2 text-base max-w-xs mx-2', {
                  'order-1 items-end': isCurrentUser,
                  'order-2 items-start': !isCurrentUser,
                })}
              >
                <span
                  className={cn('px-4 py-2 rounded-lg inline-block', {
                    'bg-indigo-600 text-white': isCurrentUser,
                    'bg-gray-200 text-gray-900': !isCurrentUser,
                    'rounded-br-none': !hasNextMsgFromSameUser && isCurrentUser,
                    'rounded-bl-none': !hasNextMsgFromSameUser && !isCurrentUser,
                  })}
                >
                  {msg.text}{' '}
                  <span className="ml-2 text-xs text-gray-400">{millisecondsToHoursAndMinutes(msg.timestamp)}</span>
                </span>
              </div>

              <div
                className={cn('relative w-6 h-6', {
                  'order-2': isCurrentUser,
                  'order-1': !isCurrentUser,
                  invisible: hasNextMsgFromSameUser,
                })}
              >
                <Image
                  fill
                  src={isCurrentUser ? (userImg as string) : msg.senderImage}
                  alt="Profile picture"
                  referrerPolicy="no-referrer"
                  className="rounded-full"
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Messages;
