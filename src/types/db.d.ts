type Chat = {
  id: string;
  messages: Message[];
}

type FriendRequest = {
  id: string;
  senderId: string;
  receiverId: string;
}