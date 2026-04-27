import { useState } from 'react';
import api from '../../api/axios';
import styles from './TaskForm.module.scss';

const TaskForm = () => {
  const [payload, setPayload] = useState('{"message": "Hello from React!"}');
  const [delay, setDelay] = useState(10); // Default 10 seconds
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      // Calculate the execution time (Current Time + Delay in seconds)
      const executionTime = new Date(Date.now() + delay * 1000).toISOString();

      const response = await api.post('/schedule', {
        executionTime,
        payload: JSON.parse(payload) // Parse the string into a JSON object
      });

      setMessage(`✅ Task Scheduled! ID: ${response.data.taskId}`);
    } catch (err) {
      console.error(err);
      setMessage(`❌ Error: ${err.response?.data?.error || "Check JSON format"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.formContainer}>
      <h3>Schedule New Task</h3>
      <form onSubmit={handleSubmit}>
        <div className={styles.inputGroup}>
          <label>Payload (JSON)</label>
          <textarea 
            value={payload}
            onChange={(e) => setPayload(e.target.value)}
            rows="4"
          />
        </div>

        <div className={styles.inputGroup}>
          <label>Delay (Seconds from now)</label>
          <input 
            type="number" 
            value={delay}
            onChange={(e) => setDelay(Number(e.target.value))}
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Scheduling...' : 'Add to Queue'}
        </button>
      </form>
      {message && <p className={styles.feedback}>{message}</p>}
    </div>
  );
};

export default TaskForm;