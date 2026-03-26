import { z } from 'zod';

export const TaskSchema = z.object({
  id: z.string().uuid().optional(),
  
  // Validation for ISO date strings
  executeAt: z.string().datetime({ 
    message: "Invalid datetime. Please use ISO format (e.g., 2026-03-26T14:00:00Z)" 
  }),
  
  // Fix: Explicitly define keys as strings
  payload: z.record(z.string(), z.any()),
  
  retries: z.number().min(0).default(0),
});

// This line extracts the Type so we can use it in other files
export type Task = z.infer<typeof TaskSchema>;