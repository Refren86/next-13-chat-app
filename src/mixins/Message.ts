import { applyMixins } from "@/lib/utils";

export class Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: number;
  receiverId?: string;

  constructor(id: string, senderId: string, text: string, timestamp: number, receiverId?: string) {
    this.id = id;
    this.senderId = senderId;
    this.receiverId = receiverId;
    this.text = text;
    this.timestamp = timestamp;
  }
}

class ChatMessage {
  senderImage: string;
  senderName: string;

  constructor(senderImage: string, senderName: string) {
    this.senderImage = senderImage;
    this.senderName = senderName;
  }
}

class GroupChatMessage {
  groupChatName: string;
  groupChatId: string;

  constructor(groupChatName: string, groupChatId: string) {
    this.groupChatName = groupChatName;
    this.groupChatId = groupChatId;
  }
}

export interface Message extends ChatMessage, GroupChatMessage {}

applyMixins(Message, [ChatMessage, GroupChatMessage]);
