import StatusBoard from './components/StatusBoard/StatusBoard';
import TaskForm from './components/TaskForm/TaskForm';
import './App.scss';

function App() {
  return (
    <div className="container">
      <header style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1>🚀 Task Scheduler Engine</h1>
        <p>Distributed Redis Queue Monitor</p>
      </header>

      <StatusBoard />
      <TaskForm />
    </div>
  );
}

export default App;