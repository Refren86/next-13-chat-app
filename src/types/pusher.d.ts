type IncomingFriendRequest = {
  requesterId: string;
  requesterEmail: string | null | undefined;
};

type GroupChat = {
  id: string;
  chatName: string;
  creator: Pick<AppUser, 'id' | 'name' | 'image'>;
  createdAt: number;
};
