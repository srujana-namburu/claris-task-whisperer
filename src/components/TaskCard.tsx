
import React, { useState } from 'react';
import { Task } from '../types/Task';
import { formatDueDate } from '../utils/taskParser';

interface TaskCardProps {
  task: Task;
  onUpdate: (task: Task) => void;
  onDelete: (id: string) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValues, setEditValues] = useState({
    name: task.name,
    assignee: task.assignee,
    priority: task.priority
  });

  const handleSave = () => {
    onUpdate({
      ...task,
      ...editValues
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValues({
      name: task.name,
      assignee: task.assignee,
      priority: task.priority
    });
    setIsEditing(false);
  };

  const toggleComplete = () => {
    onUpdate({ ...task, completed: !task.completed });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'P1': return 'priority-p1';
      case 'P2': return 'priority-p2';
      case 'P3': return 'priority-p3';
      case 'P4': return 'priority-p4';
      default: return 'priority-p3';
    }
  };

  const getDueDateColor = () => {
    if (!task.dueDate) return 'text-navy-500 dark:text-navy-400';
    
    const now = new Date();
    const dueDate = new Date(task.dueDate);
    const diffHours = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (diffHours < 0) return 'text-error';
    if (diffHours < 24) return 'text-warning';
    return 'text-navy-600 dark:text-navy-300';
  };

  const getSourceIcon = () => {
    if (task.source === 'transcript') {
      return (
        <span className="inline-flex items-center ml-2" title="Created from meeting transcript">
          <svg className="w-4 h-4 text-navy-400 dark:text-navy-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </span>
      );
    }
    return null;
  };

  return (
    <div className={`task-card animate-fade-in group ${task.completed ? 'opacity-75' : ''}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3 flex-1">
          <button
            onClick={toggleComplete}
            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-300 ease-out transform hover:scale-110 ${
              task.completed
                ? 'bg-success border-success text-white'
                : 'border-navy-300 dark:border-navy-600 hover:border-primary-light'
            }`}
          >
            {task.completed && (
              <svg className="w-3 h-3 animate-scale-in" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>
          
          <div className="flex items-center space-x-2">
            <div className={`priority-dot ${getPriorityColor(task.priority)}`}></div>
            <span className="text-xs font-medium text-navy-500 dark:text-navy-400 uppercase">
              {task.priority}
            </span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="p-1.5 rounded-lg hover:bg-navy-100 dark:hover:bg-navy-700 transition-colors duration-200 hover-scale"
          >
            <svg className="w-4 h-4 text-navy-500 dark:text-navy-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          
          <button
            onClick={() => onDelete(task.id)}
            className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors duration-200 hover-scale"
          >
            <svg className="w-4 h-4 text-navy-500 dark:text-navy-400 hover:text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
      
      {isEditing ? (
        <div className="space-y-3 animate-fade-in">
          <input
            type="text"
            value={editValues.name}
            onChange={(e) => setEditValues({ ...editValues, name: e.target.value })}
            className="input-field text-lg font-medium"
            placeholder="Task name"
          />
          
          <div className="flex space-x-3">
            <input
              type="text"
              value={editValues.assignee}
              onChange={(e) => setEditValues({ ...editValues, assignee: e.target.value })}
              className="input-field flex-1"
              placeholder="Assignee"
            />
            
            <select
              value={editValues.priority}
              onChange={(e) => setEditValues({ ...editValues, priority: e.target.value as any })}
              className="input-field"
            >
              <option value="P1">P1 - Urgent</option>
              <option value="P2">P2 - High</option>
              <option value="P3">P3 - Medium</option>
              <option value="P4">P4 - Low</option>
            </select>
          </div>
          
          <div className="flex justify-end space-x-2">
            <button onClick={handleCancel} className="btn-secondary text-sm hover-scale">
              Cancel
            </button>
            <button onClick={handleSave} className="btn-primary text-sm hover-scale">
              Save
            </button>
          </div>
        </div>
      ) : (
        <div className="group">
          <h3 className={`text-lg font-medium mb-2 flex items-center ${task.completed ? 'line-through text-navy-500 dark:text-navy-400' : 'text-navy-900 dark:text-navy-100'}`}>
            {task.name}
            {getSourceIcon()}
          </h3>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary transform transition-transform hover:scale-105">
                {task.assignee}
              </span>
            </div>
            
            <div className="text-right">
              <p className={`text-sm font-medium ${getDueDateColor()}`}>
                {formatDueDate(task.dueDate)}
              </p>
              <p className="text-xs text-navy-400 dark:text-navy-500 mt-1">
                Created {task.createdAt.toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskCard;
