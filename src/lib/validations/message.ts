import { z } from 'zod';

export const messageValidator = z.object({
  id: z.string(),
  senderId: z.string(),
  senderImage: z.string(),
  text: z.string(),
  timestamp: z.number(),
});

export const messageArrayValidator = z.array(messageValidator); // this will validate each message in array

export type Message = z.infer<typeof messageValidator>; // type of validated message
