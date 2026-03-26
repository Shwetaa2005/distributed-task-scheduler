import express, { type Request, type Response, type NextFunction } from 'express';
import dotenv from 'dotenv';
import { TaskSchema } from './schema.js';
import { addTask } from './queue.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// 1. MUST BE FIRST: Parse JSON
app.use(express.json());

// 2. Logger: This will prove if the request is reaching the server
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} request to ${req.url}`);
  next();
});

// 3. Ping Route
app.get('/ping', (req: Request, res: Response) => {
  res.json({ message: "Pong! Server is active." });
});

// 4. Schedule Route
app.post('/schedule', async (req: Request, res: Response) => {
  console.log("-> Entering /schedule route");
  try {
    console.log("-> Body received:", req.body);
    const validatedData = TaskSchema.parse(req.body);
    
    const taskId = await addTask(validatedData);
    console.log("-> Task created with ID:", taskId);
    
    res.status(201).json({ success: true, taskId });
  } catch (error: any) {
    console.error("-> Route Error:", error.message);
    res.status(400).json({ error: error.message || "Invalid Task Data" });
  }
});

// 5. Catch-all for 404s (This tells us if the route was missed)
app.use((req, res) => {
  console.log(`-> 404: No route found for ${req.method} ${req.url}`);
  res.status(404).send("Route not found on this server.");
});

app.listen(PORT, () => {
  console.log(`🚀 DEBUG SERVER started on http://localhost:${PORT}`);
});