import { z } from 'zod';

/** User persisted in localStorage under `currentUser` by the sign-in page. */
export const sessionUserSchema = z.object({
  id: z.union([z.number(), z.string()]).optional(),
  email: z.string().optional(),
  name: z.string().optional(),
});
