'use client';

import axios from 'axios';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, UserPlus, X } from 'lucide-react';

import { pusherClient } from '@/lib/pusher';
import { toPusherKey } from '@/lib/utils';

type Props = {
  sessionId: string;
  incomingFriendRequests: IncomingFriendRequest[];
};

const FriendRequests = ({ sessionId, incomingFriendRequests }: Props) => {
  const router = useRouter();
  const [friendRequests, setFriendRequests] = useState<IncomingFriendRequest[]>(incomingFriendRequests);

  useEffect(() => {
    // subscribe for any changes in friend requests
    pusherClient.subscribe(toPusherKey(`user:${sessionId}:incoming_friend_requests`));

    // senderId and senderEmail coming from pusher as api response
    const friendRequestHandler = ({ requesterId, requesterEmail }: IncomingFriendRequest) => {
      setFriendRequests((prevRequests) => [...prevRequests, { requesterId, requesterEmail }]);
    };

    // whenever listener spots incoming_friend_requests call, trigger friendRequestHandler function
    pusherClient.bind('incoming_friend_requests', friendRequestHandler);

    // cancelling all subscriptions/listeners
    return () => {
      pusherClient.unsubscribe(toPusherKey(`user:${sessionId}:incoming_friend_requests`));
      pusherClient.unbind('incoming_friend_requests', friendRequestHandler);
    };
  }, []);

  const acceptFriend = async (requesterId: string) => {
    await axios.post('/api/friends/accept', { id: requesterId });

    setFriendRequests((prevRequests) => prevRequests.filter((req) => req.requesterId !== requesterId));
    router.refresh();
  };

  const denyFriend = async (requesterId: string) => {
    await axios.post('/api/friends/deny', { id: requesterId });

    setFriendRequests((prevRequests) => prevRequests.filter((req) => req.requesterId !== requesterId));
    router.refresh();
  };

  return (
    <>
      {friendRequests.length === 0 ? (
        <p className="text-sm text-zinc-500">Nothing to show here</p>
      ) : (
        friendRequests.map((req) => (
          <div key={req.requesterId} className="flex gap-4 items-center">
            <UserPlus className="text-black" />
            <p className="font-medium text-lg">{req.requesterEmail}</p>

            <button
              aria-label="accept friend"
              onClick={() => acceptFriend(req.requesterId)}
              className="w-8 h-8 bg-indigo-600 hover:bg-indigo-700 grid place-items-center rounded-full transition hover:shadow-md"
            >
              <Check className="font-semibold text-white w-3/4 h-3/4" />
            </button>

            <button
              onClick={() => denyFriend(req.requesterId)}
              aria-label="deny friend"
              className="w-8 h-8 bg-red-600 hover:bg-red-700 grid place-items-center rounded-full transition hover:shadow-md"
            >
              <X className="font-semibold text-white w-3/4 h-3/4" />
            </button>
          </div>
        ))
      )}
    </>
  );
};

export default FriendRequests;
