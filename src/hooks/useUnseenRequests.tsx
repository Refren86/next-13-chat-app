import { useState } from 'react';

export const useUnseenRequests = ({ initialUnseenReqCount }: { initialUnseenReqCount: number }) => {
  const [unseenReqCount, setUnseenReqCount] = useState<number>(initialUnseenReqCount);

  const newFriendHandler = () => {
    setUnseenReqCount((prevCount) => prevCount - 1);
  };

  const incomingReqHandler = () => {
    setUnseenReqCount((prevCount) => prevCount + 1);
  };

  return {
    unseenReqCount,
    newFriendHandler,
    incomingReqHandler,
  }
};
