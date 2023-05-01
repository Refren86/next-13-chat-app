"use client"

import { useState } from "react";

type Props = {
  sessionId: string;
  incomingFriendRequests: IncomingFriendRequest[];
};

const FriendRequests = ({ sessionId, incomingFriendRequests }: Props) => {
  const [friendRequests, setFriendRequests] = useState<IncomingFriendRequest[]>(incomingFriendRequests);

  return <></>;
};

export default FriendRequests