import { z } from 'zod';

export const TaskSchema = z.object({
  executeAt: z.string(), 
  payload: z.any() 
});