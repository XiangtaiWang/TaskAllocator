import React, { useState, useEffect, useRef } from 'react';
import './App.css';

interface Task {
  id: number;
  name: string;
}

interface Member {
  id: number;
  name: string;
}

interface Assignment {
  member: string;
  task: string;
}

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [newTask, setNewTask] = useState('');
  const [newMember, setNewMember] = useState('');
  const [spinning, setSpinning] = useState(false);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const wheelCanvasRef = useRef<HTMLCanvasElement>(null);
  const pointerCanvasRef = useRef<HTMLCanvasElement>(null);
  const [rotation, setRotation] = useState(0);

  const addTask = () => {
    if (newTask.trim()) {
      setTasks([...tasks, { id: Date.now(), name: newTask.trim() }]);
      setNewTask('');
    }
  };

  const deleteTask = (id: number) => {
    setTasks(tasks.filter(task => task.id !== id));
    setAssignments([]);
  };

  const addMember = () => {
    if (newMember.trim()) {
      setMembers([...members, { id: Date.now(), name: newMember.trim() }]);
      setNewMember('');
    }
  };

  const deleteMember = (id: number) => {
    setMembers(members.filter(member => member.id !== id));
    setAssignments([]);
  };

  const spinWheel = () => {
    if (tasks.length === 0 || members.length === 0) return;
    setSpinning(true);
    setAssignments([]);
    const spinDuration = 3000; // 3 seconds
    const randomRotations = 720 + Math.random() * 360; // 2-3 full rotations
    setRotation(randomRotations);

    setTimeout(() => {
      setSpinning(false);
      assignTasks(randomRotations);
    }, spinDuration);
  };

  const reset = ()=>{
    setSpinning(false)
    setAssignments([])
    setMembers([])
    setTasks([])
  }
  // Assign tasks based on final rotation
  const assignTasks = (finalRotation: number) => {
    const segmentAngle = 360 / tasks.length;
    const assignments: Assignment[] = members.map((member, index) => {
      // Calculate pointer angle (evenly spaced)
      const pointerAngle = (index * 360) / members.length;
      // Normalize final wheel angle
      const normalizedAngle = ((finalRotation % 360) + 360) % 360;
      // Calculate which segment the pointer lands on
      const segmentIndex = Math.floor((360 - normalizedAngle + pointerAngle) % 360 / segmentAngle) % tasks.length;
      return {
        member: member.name,
        task: tasks[segmentIndex].name,
      };
    });
    setAssignments(assignments);
  };

  // Draw the wheel and pointers
  useEffect(() => {
    // Draw wheel
    const wheelCanvas = wheelCanvasRef.current;
    if (!wheelCanvas) return;
    const wheelCtx = wheelCanvas.getContext('2d');
    if (!wheelCtx) return;

    const centerX = wheelCanvas.width / 2;
    const centerY = wheelCanvas.height / 2;
    const radius = Math.min(wheelCanvas.width, wheelCanvas.height) / 2 - 20;

    // Clear wheel canvas
    wheelCtx.clearRect(0, 0, wheelCanvas.width, wheelCanvas.height);

    // Draw wheel segments
    const segmentAngle = 2 * Math.PI / tasks.length;
    wheelCtx.save();
    wheelCtx.translate(centerX, centerY);
    wheelCtx.rotate((rotation * Math.PI) / 180);
    tasks.forEach((task, index) => {
      wheelCtx.beginPath();
      wheelCtx.moveTo(0, 0);
      wheelCtx.arc(0, 0, radius, index * segmentAngle, (index + 1) * segmentAngle);
      wheelCtx.fillStyle = `hsl(${index * 360 / tasks.length}, 70%, 50%)`;
      wheelCtx.fill();
      wheelCtx.stroke();

      // Draw task name
      wheelCtx.save();
      wheelCtx.rotate(segmentAngle * index + segmentAngle / 2);
      wheelCtx.fillStyle = '#fff';
      wheelCtx.font = '16px Arial';
      wheelCtx.textAlign = 'center';
      wheelCtx.textBaseline = 'middle';
      wheelCtx.fillText(task.name, radius / 2, 0);
      wheelCtx.restore();
    });

    // Draw center circle
    wheelCtx.restore();
    wheelCtx.beginPath();
    wheelCtx.arc(centerX, centerY, 20, 0, 2 * Math.PI);
    wheelCtx.fillStyle = '#fff';
    wheelCtx.fill();
    wheelCtx.stroke();

    // Draw pointers
    const pointerCanvas = pointerCanvasRef.current;
    if (!pointerCanvas) return;
    const pointerCtx = pointerCanvas.getContext('2d');
    if (!pointerCtx) return;

    // Clear pointer canvas
    pointerCtx.clearRect(0, 0, pointerCanvas.width, pointerCanvas.height);

    // Draw pointers (fixed)
    members.forEach((member, index) => {
      const pointerAngle = (index * 360 / members.length) * Math.PI / 180;
      pointerCtx.beginPath();
      pointerCtx.moveTo(
        centerX + radius * Math.cos(pointerAngle),
        centerY + radius * Math.sin(pointerAngle)
      );
      pointerCtx.lineTo(
        centerX + (radius - 20) * Math.cos(pointerAngle - 0.1),
        centerY + (radius - 20) * Math.sin(pointerAngle - 0.1)
      );
      pointerCtx.lineTo(
        centerX + (radius - 20) * Math.cos(pointerAngle + 0.1),
        centerY + (radius - 20) * Math.sin(pointerAngle + 0.1)
      );
      pointerCtx.closePath();
      pointerCtx.fillStyle = '#000';
      pointerCtx.fill();

      // Draw member name
      pointerCtx.font = '14px Arial';
      pointerCtx.fillStyle = '#000';
      pointerCtx.textAlign = pointerAngle < Math.PI / 2 || pointerAngle > 3 * Math.PI / 2 ? 'left' : 'right';
      pointerCtx.textBaseline = 'middle';
      const textOffset = 10; // Distance from pointer
      const textX = centerX + (radius + textOffset) * Math.cos(pointerAngle);
      const textY = centerY + (radius + textOffset) * Math.sin(pointerAngle);
      pointerCtx.fillText(member.name, textX, textY);

    });
  }, [tasks, members, rotation]);

  return (
    <div className="app-container">
      <h1 className="app-title">Task Assignment Spinner</h1>

      {/* Task Input */}
      <div className="section-container">
        <h2 className="section-title">Tasks</h2>
        <div className="input-group">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Enter task"
            className="input-field"
          />
          <button
            onClick={addTask}
            className="action-button add-button"
          >
            Add
          </button>
        </div>
        <ul className="item-list">
          {tasks.map(task => (
            <li key={task.id} className="item">
              <span>{task.name}</span>
              <button
                onClick={() => deleteTask(task.id)}
                className="delete-button"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Member Input */}
      <div className="section-container">
        <h2 className="section-title">Members</h2>
        <div className="input-group">
          <input
            type="text"
            value={newMember}
            onChange={(e) => setNewMember(e.target.value)}
            placeholder="Enter member"
            className="input-field"
          />
          <button
            onClick={addMember}
            className="action-button add-button"
          >
            Add
          </button>
        </div>
        <ul className="item-list">
          {members.map(member => (
            <li key={member.id} className="item">
              <span>{member.name}</span>
              <button
                onClick={() => deleteMember(member.id)}
                className="delete-button"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Spinner */}
      <div className="spinner-container">
        <div className="canvas-wrapper">
          <canvas
            ref={wheelCanvasRef}
            width={400}
            height={400}
            className={`wheel-canvas ${spinning ? 'spinning' : ''}`}
          />
          <canvas
            ref={pointerCanvasRef}
            width={400}
            height={400}
            className="pointer-canvas"
          />
        </div>
        <button
          onClick={spinWheel}
          disabled={spinning || tasks.length === 0 || members.length === 0}
          className="action-button spin-button"
        >
          Spin
        </button>
        <button
          onClick={reset}
          className="action-button reset-button"
        >
          Reset
        </button>
      </div>

      {/* Assignments */}
      {assignments.length > 0 && (
        <div className="section-container">
          <h2 className="section-title">Assignments</h2>
          <ul className="item-list">
            {assignments.map((assignment, index) => (
              <li key={index} className="item">
                {assignment.task} is assigned to {assignment.member}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default App;