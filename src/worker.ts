import redisClient from './redis.js';

export const startWorker = () => {
  console.log("👷 Worker Engine Started: System is now fully functional.");

  setInterval(async () => {
    try {
      const now = Date.now();
      const taskIds = await redisClient.zrangebyscore('tasks:scheduled', 0, now);

      if (taskIds.length > 0) {
        for (const id of taskIds) {
          const taskData = await redisClient.hgetall(`task:data:${id}`);

          if (Object.keys(taskData).length === 0) {
            await redisClient.zrem('tasks:scheduled', id);
            continue;
          }

          try {
            console.log(`🚀 EXECUTING: ${id}`);
            
            // --- REAL LOGIC GOES HERE ---
            // For example: await sendEmail(taskData.payload);
            // For now, we simulate a successful execution.
            console.log(`📦 Task Content:`, JSON.parse(taskData.payload));
            
            // ---------------------------

            console.log(`✅ SUCCESS: Task ${id} processed.`);
            
            // Clean up Redis on success
            await redisClient.zrem('tasks:scheduled', id);
            await redisClient.del(`task:data:${id}`);

          } catch (executionError: any) {
            const currentRetries = parseInt(taskData.retries || "0");
            const maxRetries = 3;

            if (currentRetries < maxRetries) {
              // Exponential Backoff: Wait longer each time (30s, 60s, 90s)
              const waitTime = 30000 * (currentRetries + 1);
              const nextAttempt = Date.now() + waitTime; 
              
              console.log(`⚠️  EXECUTION FAILED: ${executionError.message}`);
              console.log(`🔄 Rescheduling ${id} in ${waitTime/1000}s...`);

              await redisClient.hset(`task:data:${id}`, 'retries', currentRetries + 1);
              await redisClient.zadd('tasks:scheduled', nextAttempt, id);
            } else {
              console.log(`❌ FATAL: Task ${id} failed after ${maxRetries} attempts. Purging from queue.`);
              await redisClient.zrem('tasks:scheduled', id);
              await redisClient.del(`task:data:${id}`);
            }
          }
        }
      }
    } catch (error) {
      console.error("❌ Worker Loop Error:", error);
    }
  }, 5000); 
};