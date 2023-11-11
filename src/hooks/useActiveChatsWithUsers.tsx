import { useState } from 'react';

import { AppUser } from '@/mixins/AppUser';

type UseActiveChatsWithUsersArgs = {
  friends: AppUser[];
};

const useActiveChatsWithUsers = ({ friends }: UseActiveChatsWithUsersArgs) => {
  const [activeChats, setActiveChats] = useState<AppUser[]>(friends);

  const newFriendHandler = (newFriend: AppUser) => {
    setActiveChats((prevChats) => [...prevChats, newFriend]);
  };

  return {
    activeChats,
    newFriendHandler,
  };
};

export default useActiveChatsWithUsers;
