type Chat = {
  id: string;
  messages: Message[];
}

type Message = {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: number;
}

type FriendRequest = {
  id: string;
  senderId: string;
  receiverId: string;
}