import express, { type Request, type Response, type NextFunction } from 'express';
import dotenv from 'dotenv';
import { TaskSchema } from './schema.js';
import { addTask } from './queue.js';
import { startWorker } from './worker.js';

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
  console.log("-> 1. Route entered");
  try {
    const body = req.body;
    
    // Manual check BEFORE Zod touches it
    if (!body.executeAt || !body.payload) {
      return res.status(400).json({ error: "Missing executeAt or payload" });
    }

    console.log("-> 2. Attempting Zod parse");
    const validatedData = TaskSchema.parse(body);
    console.log("-> 3. Zod parse successful");

    const executionTime = new Date(validatedData.executeAt).getTime();
    const now = Date.now();

    if (isNaN(executionTime)) {
      return res.status(400).json({ error: "Invalid date format" });
    }

    if (executionTime <= now) {
      return res.status(400).json({ error: "Cannot schedule in the past" });
    }

    const taskId = await addTask({
        ...validatedData,
        retries: body.retries || 0
    });
    
    res.status(201).json({ success: true, taskId });

  } catch (error: any) {
    console.error("-> CRASH DETAIL:", error.name, error.message);
    res.status(500).json({ error: "Internal Server Error" });
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

// Start the Worker loop
startWorker();

app.listen(PORT, () => {
  console.log(`🚀 API Server & Worker running on http://localhost:${PORT}`);
});