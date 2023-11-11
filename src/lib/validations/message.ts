import { z } from 'zod';

// refactor here (add different validators)...
export const messageValidator = z.object({
  id: z.string(),
  senderId: z.string(),
  senderImage: z.string(),
  senderName: z.string(),
  text: z.string(),
  timestamp: z.number(),
});

export const groupChatMessageValidator = z.object({
  id: z.string(),
  senderId: z.string(),
  senderName: z.string(),
  senderImage: z.string(),
  text: z.string(),
  timestamp: z.number(),
  groupChatId: z.string(),
  groupChatName: z.string(),
});

 // this will validate each message in array
export const messageArrayValidator = z.array(messageValidator);
export const groupChatMessageArrayValidator = z.array(groupChatMessageValidator);
