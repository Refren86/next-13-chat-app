'use client';

import Image from 'next/image';

import Modal from './Modal';
import { AppUser } from '@/mixins/AppUser';
import { useFilter } from '@/hooks/useFilter';

type GroupChatInfoModalProps = {
  isOpen: boolean;
  groupChatInfo: GroupChat;
  groupChatMembers: AppUser[];
  onClose: () => void;
};

const GroupChatInfoModal = ({ isOpen, onClose, groupChatInfo, groupChatMembers }: GroupChatInfoModalProps) => {
  const { searchWord, handleSearch } = useFilter();

  const filteredGroupChatMembers = groupChatMembers.filter((member) =>
    member.name.toLowerCase().includes(searchWord.toLocaleLowerCase()),
  );

  return (
    <Modal isOpen={isOpen} title={groupChatInfo.chatName} onClose={onClose}>
      <div className="my-4">
        <input
          value={searchWord}
          onChange={handleSearch}
          placeholder="Search participants..."
          className="block w-full rounded-md border-0 py-1.5 px-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
        />

        <div className="flex flex-col space-y-3 mt-4">
          {filteredGroupChatMembers?.length > 0 &&
            filteredGroupChatMembers.map((member) => (
              <div key={member.id} className="flex items-center space-x-2">
                <div className="relative w-8 h-8">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>

                <p className="text-sm text-gray-700">
                  {member.name}{' '}
                  <span className="text-gray-400">{groupChatInfo.creator.id === member.id ? '(Admin)' : ''}</span>
                </p>
              </div>
            ))}
        </div>
      </div>
    </Modal>
  );
};

export default GroupChatInfoModal;
