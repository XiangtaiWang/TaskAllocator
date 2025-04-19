import React, { useState, FormEvent } from 'react';
import './App.css';

// Define types
interface Member {
  id: number;
  name: string;
}

interface Task {
  id: number;
  description: string;
}

interface Assignment {
  member: string;
  task: string;
}

const App: React.FC = () => {
  // State for inputs and assignments
  const [members, setMembers] = useState<Member[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [memberInput, setMemberInput] = useState<string>('');
  const [taskInput, setTaskInput] = useState<string>('');
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  // Add member
  const addMember = (e: FormEvent) => {
    e.preventDefault();
    if (memberInput.trim()) {
      setMembers([...members, { id: Date.now(), name: memberInput.trim() }]);
      setMemberInput('');
    }
  };

  // Add task
  const addTask = (e: FormEvent) => {
    e.preventDefault();
    if (taskInput.trim()) {
      setTasks([...tasks, { id: Date.now(), description: taskInput.trim() }]);
      setTaskInput('');
    }
  };

  // Spin the roulette
  const spinRoulette = () => {
    if (members.length === 0 || tasks.length === 0) {
      alert('Please add at least one member and one task!');
      return;
    }

    // Shuffle arrays
    const shuffledMembers = [...members].sort(() => Math.random() - 0.5);
    const shuffledTasks = [...tasks].sort(() => Math.random() - 0.5);

    // Assign tasks to members
    const newAssignments: Assignment[] = [];
    shuffledMembers.forEach((member, index) => {
      const task = shuffledTasks[index % shuffledTasks.length]; // Loop tasks if fewer than members
      newAssignments.push({ member: member.name, task: task.description });
    });

    setAssignments(newAssignments);
  };

  return (
    <div className="App">
      <h1>Task Roulette</h1>

      {/* Member Input */}
      <form onSubmit={addMember}>
        <input
          type="text"
          value={memberInput}
          onChange={(e) => setMemberInput(e.target.value)}
          placeholder="Enter member name"
        />
        <button type="submit">Add Member</button>
      </form>
      <ul>
        {members.map((member) => (
          <li key={member.id}>{member.name}</li>
        ))}
      </ul>

      {/* Task Input */}
      <form onSubmit={addTask}>
        <input
          type="text"
          value={taskInput}
          onChange={(e) => setTaskInput(e.target.value)}
          placeholder="Enter task"
        />
        <button type="submit">Add Task</button>
      </form>
      <ul>
        {tasks.map((task) => (
          <li key={task.id}>{task.description}</li>
        ))}
      </ul>

      {/* Spin Button */}
      <button onClick={spinRoulette}>Spin the Roulette!</button>

      {/* Results */}
      {assignments.length > 0 && (
        <div>
          <h2>Assignments</h2>
          <ul>
            {assignments.map((assignment, index) => (
              <li key={index}>
                {assignment.member} - {assignment.task}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default App;