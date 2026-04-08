import redisClient from './redis.js';

export const startWorker = () => {
  console.log("👷 Worker Engine Started: Watching for due tasks...");

  // We use setInterval to create a "Polling Loop"
  setInterval(async () => {
    try {
      const now = Date.now(); // The current time in milliseconds

      // 1. ZRANGEBYSCORE: Get tasks where score is between 0 and "now"
      // This ignores all tasks scheduled for the future.
      const taskIds = await redisClient.zrangebyscore('tasks:scheduled', 0, now);

      if (taskIds.length > 0) {
        console.log(`🎯 Found ${taskIds.length} task(s) ready to run!`);

        for (const id of taskIds) {
          // 2. Fetch the "Heavy" payload from the Hash using the ID
          const taskData = await redisClient.hgetall(`task:data:${id}`);

          if (Object.keys(taskData).length === 0) {
            // Safety check: if data is missing, just remove the ID and move on
            await redisClient.zrem('tasks:scheduled', id);
            continue;
          }

          // 3. SIMULATE EXECUTION
          console.log(`-------------------------------------------`);
          console.log(`🚀 EXECUTING TASK ID: ${id}`);
          console.log(`📦 PAYLOAD:`, JSON.parse(taskData.payload));
          console.log(`⏰ ORIGINALLY SCHEDULED FOR: ${taskData.executeAt}`);
          
          // In a real app, this is where you'd call an Email API or a Payment Gateway
          console.log(`✅ Task processed successfully.`);

          // 4. CLEAN UP (The Acknowledge step)
          // We must remove the task from BOTH the Set and the Hash
          await redisClient.zrem('tasks:scheduled', id);
          await redisClient.del(`task:data:${id}`);
          console.log(`🗑️  Task ${id} removed from Redis.`);
          console.log(`-------------------------------------------`);
        }
      }
    } catch (error) {
      console.error("❌ Worker Error:", error);
    }
  }, 5000); // Check every 5 seconds
};