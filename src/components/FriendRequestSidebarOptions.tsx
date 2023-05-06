'use client';

import Link from 'next/link';
import { User } from 'lucide-react';
import { useEffect, useState } from 'react';

import { toPusherKey } from '@/lib/utils';
import { pusherClient } from '@/lib/pusher';

type FriendRequestSidebarOptionsProps = {
  sessionId: string;
  initialUnseenReqCount: number;
};

const FriendRequestSidebarOptions = ({ sessionId, initialUnseenReqCount }: FriendRequestSidebarOptionsProps) => {
  const [unseenReqCount, setUnseenReqCount] = useState<number>(initialUnseenReqCount);

  useEffect(() => {
    pusherClient.subscribe(toPusherKey(`user:${sessionId}:friends`));
    pusherClient.subscribe(toPusherKey(`user:${sessionId}:incoming_friend_requests`));

    const newFriendHandler = () => {
      setUnseenReqCount((prevCount) => prevCount - 1);
    }

    const incomingReqHandler = () => {
      setUnseenReqCount((prevCount) => prevCount + 1);
    };

    pusherClient.bind('new_friend', newFriendHandler);
    pusherClient.bind('incoming_friend_requests', incomingReqHandler);

    return () => {
      pusherClient.unsubscribe(toPusherKey(`user:${sessionId}:friends`));
      pusherClient.unsubscribe(toPusherKey(`user:${sessionId}:incoming_friend_requests`));

      pusherClient.unbind('new_friend', newFriendHandler);
      pusherClient.unbind('incoming_friend_requests', incomingReqHandler);
    };
  }, [sessionId]);

  return (
    <Link
      href="/dashboard/requests"
      className="text-gray-700 hover:text-indigo-600 hover:bg-gray-50 group flex items-center gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
    >
      <div className="text-gray-400 border-gray-200 group-hover:border-indigo-600 group-hover:text-indigo-600 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border text-[0.625rem] font-medium bg-white">
        <User className="h-4 w-4" />
      </div>
      <p className="truncate">Friend requests</p>

      {unseenReqCount > 0 && (
        <div className="rounded-full w-5 h-5 text-xs flex justify-center items-center text-white bg-indigo-600">
          {unseenReqCount}
        </div>
      )}
    </Link>
  );
};

export default FriendRequestSidebarOptions;
