'use client';

import { useState } from 'react';

import { AppUser } from '@/mixins/AppUser';
import GroupChatInfoModal from './GroupChatInfoModal';

type GroupChatIconBtnProps = {
  groupChatInfo: GroupChat;
  groupChatMembers: AppUser[];
};

const GroupChatIconBtn = ({ groupChatInfo, groupChatMembers }: GroupChatIconBtnProps) => {
  const [isParticipantsModalOpen, setIsParticipantsModalOpen] = useState(false);

  const showParticipantsModal = () => {
    setIsParticipantsModalOpen(true);
  };

  const hideParticipantsModal = () => {
    setIsParticipantsModalOpen(false);
  };

  return (
    <>
      <button
        onClick={showParticipantsModal}
        className="flex justify-center items-center w-full h-full rounded-full bg-emerald-700 text-white cursor-pointer"
      >
        <h2>
          {groupChatInfo.chatName?.length > 4 ? `${groupChatInfo.chatName.slice(0, 3)}...` : groupChatInfo.chatName}
        </h2>
      </button>

      {isParticipantsModalOpen && (
        <GroupChatInfoModal
          isOpen={isParticipantsModalOpen}
          groupChatInfo={groupChatInfo}
          groupChatMembers={groupChatMembers}
          onClose={hideParticipantsModal}
        />
      )}
    </>
  );
};

export default GroupChatIconBtn;
