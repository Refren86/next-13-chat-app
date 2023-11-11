import toast from 'react-hot-toast';
import { useState } from 'react';

import UnseenChatToast from '@/components/UnseenChatToast';

type UseActiveGroupChatsArgs = {
  groupChats: GroupChat[];
  userId: string;
};

const useActiveGroupChats = ({ groupChats, userId }: UseActiveGroupChatsArgs) => {
  const [activeChats, setActiveChats] = useState<GroupChat[]>(groupChats);

  const groupChatInvitationHandler = (chatInvitation: GroupChat) => {
    toast.custom((t) => (
      <UnseenChatToast
        t={t}
        href={`/dashboard/group-chat/${chatInvitation.id}`}
        senderId={chatInvitation.id}
        senderImg={chatInvitation.creator.image}
        senderMessage={`Has invited you to a group chat ${chatInvitation.chatName}`}
        senderName={chatInvitation.creator.name}
        userId={userId}
      />
    ));

    setActiveChats((prevChats) => [...prevChats, chatInvitation]);
  };

  return {
    activeChats,
    groupChatInvitationHandler,
  };
};

export default useActiveGroupChats;
