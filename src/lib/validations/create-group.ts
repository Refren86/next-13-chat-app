import { z } from 'zod';

export const createGroupValidator = z.object({
  chatName: z.string().min(2).max(20),
});
