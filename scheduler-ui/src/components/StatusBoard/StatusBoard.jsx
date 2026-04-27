import { useEffect, useState } from 'react';
import api from '../../api/axios';
import styles from './StatusBoard.module.scss';

const StatusBoard = () => {
  const [metrics, setMetrics] = useState({
    total_tasks_in_redis: 0,
    tasks_ready_to_process: 0,
    tasks_waiting_for_future: 0
  });

  const getStats = async () => {
    try {
      const res = await api.get('/status');
      setMetrics(res.data.metrics);
    } catch (err) {
      console.error("Monitor offline", err);
    }
  };

  useEffect(() => {
    getStats();
    const timer = setInterval(getStats, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className={styles.board}>
      <div className={styles.card}>
        <span>Total Queued</span>
        <h2>{metrics.total_tasks_in_redis}</h2>
      </div>
      <div className={`${styles.card} ${metrics.tasks_ready_to_process > 0 ? styles.alert : ''}`}>
        <span>Ready to Process</span>
        <h2>{metrics.tasks_ready_to_process}</h2>
      </div>
      <div className={styles.card}>
        <span>Upcoming Tasks</span>
        <h2>{metrics.tasks_waiting_for_future}</h2>
      </div>
    </section>
  );
};

export default StatusBoard;