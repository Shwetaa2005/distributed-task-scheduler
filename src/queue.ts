import redisClient from './redis.js';
import { type Task } from './schema.js';
import { v4 as uuidv4 } from 'uuid';

// We use Omit to say: "Give me the Task type, but ignore the 'id' field for now"
export const addTask = async (taskData: Task) => {
  const id = uuidv4();
  const executeAtTimestamp = new Date(taskData.executeAt).getTime();

  await redisClient.hset(`task:data:${id}`, {
    id,
    payload: JSON.stringify(taskData.payload),
    executeAt: taskData.executeAt,
    retries: taskData.retries.toString(),
  });

  await redisClient.zadd('tasks:scheduled', executeAtTimestamp, id);

  return id;
};