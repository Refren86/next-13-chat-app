'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import Input from './base/Input';
import { Button } from './base/Button';
import axios from 'axios';

type CreateGroupFormProps = {
  friends: AppUser[];
};

type GroupInputs = {
  chatName: string;
};

const CreateGroupForm = ({ friends }: CreateGroupFormProps) => {
  const { register, handleSubmit, reset } = useForm<GroupInputs>();

  const [selectedFriendsIds, setSelectedFriendsIds] = useState<string[]>([]);

  const isFriendSelected = (id: string) => selectedFriendsIds.some((friendId) => friendId === id);

  const toggleSelectFriendId = (id: string) => {
    isFriendSelected(id)
      ? setSelectedFriendsIds((prevIds) => prevIds.filter((friendId) => friendId !== id))
      : setSelectedFriendsIds((prevIds) => [...prevIds, id]);
  };

  const submit = async (data: GroupInputs) => {
    const { chatName } = data;

    await axios.post('/api/group-chat/create', {
      chatName,
      userIds: selectedFriendsIds,
    });

    reset();
  };

  return friends.length > 0 ? (
    <form className="max-w-sm" onSubmit={handleSubmit(submit)}>
      <Input id="chatName" label="Group name" placeholder="Enter group name" register={register} />
      <div className="mt-6">
        <h2 className="mb-4 text-xl text-bold">Add friends to the group</h2>

        {friends.map((friend) => (
          <div key={friend.email} className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-x-4">
              <div className="relative w-16 h-16 rounded-full overflow-hidden">
                <Image src={friend.image} alt={friend.name} fill />
              </div>

              <p className="font-bold">{friend.name}</p>
            </div>

            <Button type="button" onClick={() => toggleSelectFriendId(friend.id)}>
              {isFriendSelected(friend.id) ? 'Remove' : 'Add'}
            </Button>
          </div>
        ))}
      </div>

      <Button className="mt-6" type="submit" disabled={selectedFriendsIds.length === 0}>
        Create group
      </Button>
    </form>
  ) : (
    <h2>To create a group you need at least 1 friend</h2>
  );
};

export default CreateGroupForm;
