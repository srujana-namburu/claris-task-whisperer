
import React, { useState, useEffect } from 'react';
import { Task, ParsedTask, BatchParsedTask } from '../types/Task';
import { ThemeProvider } from '../contexts/ThemeContext';
import Header from '../components/Header';
import TaskInput from '../components/TaskInput';
import TaskBoard from '../components/TaskBoard';
import MeetingMinutesParser from '../components/MeetingMinutesParser';

const Index = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [useGPT, setUseGPT] = useState(false);

  // Load tasks from localStorage on mount
  useEffect(() => {
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
      try {
        const parsedTasks = JSON.parse(savedTasks).map((task: any) => ({
          ...task,
          dueDate: task.dueDate ? new Date(task.dueDate) : null,
          createdAt: new Date(task.createdAt),
          source: task.source || 'manual' // Default to manual for backward compatibility
        }));
        setTasks(parsedTasks);
      } catch (error) {
        console.error('Error loading tasks from localStorage:', error);
      }
    }
  }, []);

  // Save tasks to localStorage whenever tasks change
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  const handleTaskCreate = (parsedTask: ParsedTask) => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      ...parsedTask,
      completed: false,
      createdAt: new Date(),
      source: parsedTask.source || 'manual'
    };
    
    setTasks(prev => [newTask, ...prev]);
  };

  const handleTaskUpdate = (updatedTask: Task) => {
    setTasks(prev => prev.map(task => 
      task.id === updatedTask.id ? updatedTask : task
    ));
  };

  const handleTaskDelete = (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
  };

  const handleBatchTasksAdd = (batchTasks: BatchParsedTask[]) => {
    const newTasks: Task[] = batchTasks.filter(task => task.selected).map(task => ({
      id: task.id,
      name: task.name,
      assignee: task.assignee,
      dueDate: task.dueDate,
      priority: task.priority,
      completed: false,
      createdAt: new Date(),
      source: 'transcript'
    }));

    setTasks(prev => [...newTasks, ...prev]);
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-navy-50 dark:bg-navy-900 transition-colors duration-300">
        <Header />
        
        <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
          <div className="text-center mb-8 animate-fade-in">
            <h2 className="text-3xl font-bold text-navy-900 dark:text-navy-100 mb-3">
              Natural Language Task Management
            </h2>
            <p className="text-lg text-navy-600 dark:text-navy-400 max-w-2xl mx-auto">
              Create and manage tasks using natural language. Simply describe what needs to be done, 
              who should do it, and when it's due.
            </p>
          </div>
          
          <TaskInput onTaskCreate={handleTaskCreate} />
          
          <MeetingMinutesParser 
            onTasksExtracted={handleBatchTasksAdd}
            useGPT={useGPT}
          />
          
          <TaskBoard 
            tasks={tasks}
            onTaskUpdate={handleTaskUpdate}
            onTaskDelete={handleTaskDelete}
          />
        </main>
        
        <footer className="border-t border-navy-200 dark:border-navy-700 mt-16 py-8">
          <div className="max-w-6xl mx-auto px-6 text-center">
            <p className="text-navy-500 dark:text-navy-400">
              Built with React, TypeScript, and Tailwind CSS
            </p>
          </div>
        </footer>
      </div>
    </ThemeProvider>
  );
};

export default Index;
