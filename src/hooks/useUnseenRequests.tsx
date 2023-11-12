import { useCallback, useState } from 'react';

export const useUnseenRequests = ({ initialUnseenReqCount }: { initialUnseenReqCount: number }) => {
  const [unseenReqCount, setUnseenReqCount] = useState<number>(initialUnseenReqCount);

  const newFriendHandler = useCallback(() => {
    setUnseenReqCount((prevCount) => prevCount - 1);
  }, []);

  const incomingReqHandler = useCallback(() => {
    setUnseenReqCount((prevCount) => prevCount + 1);
  }, []);

  return {
    unseenReqCount,
    newFriendHandler,
    incomingReqHandler,
  };
};
