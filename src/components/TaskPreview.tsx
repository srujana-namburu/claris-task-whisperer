
import React from 'react';
import { ParsedTask } from '../types/Task';
import { formatDueDate } from '../utils/taskParser';

interface TaskPreviewProps {
  task: ParsedTask;
  onConfirm: () => void;
  onEdit: (field: string, value: any) => void;
  onCancel: () => void;
}

const TaskPreview: React.FC<TaskPreviewProps> = ({ task, onConfirm, onEdit, onCancel }) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'P1': return 'priority-p1';
      case 'P2': return 'priority-p2';
      case 'P3': return 'priority-p3';
      case 'P4': return 'priority-p4';
      default: return 'priority-p3';
    }
  };

  return (
    <div className="animate-fade-in bg-white dark:bg-navy-800 rounded-xl border border-navy-200 dark:border-navy-700 p-6 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-navy-900 dark:text-navy-100 flex items-center">
          <svg className="w-5 h-5 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          Task Preview
        </h3>
        <div className="flex items-center space-x-2">
          <div className={`priority-dot ${getPriorityColor(task.priority)}`}></div>
          <span className="text-xs font-medium text-navy-500 dark:text-navy-400 uppercase">
            {task.priority}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-navy-700 dark:text-navy-300 mb-1">
            Task Name
          </label>
          <input
            type="text"
            value={task.name}
            onChange={(e) => onEdit('name', e.target.value)}
            className="input-field"
            placeholder="Task name"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-navy-700 dark:text-navy-300 mb-1">
              Assignee
            </label>
            <input
              type="text"
              value={task.assignee}
              onChange={(e) => onEdit('assignee', e.target.value)}
              className="input-field"
              placeholder="Assignee name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-navy-700 dark:text-navy-300 mb-1">
              Priority
            </label>
            <select
              value={task.priority}
              onChange={(e) => onEdit('priority', e.target.value)}
              className="input-field"
            >
              <option value="P1">P1 - Urgent</option>
              <option value="P2">P2 - High</option>
              <option value="P3">P3 - Medium</option>
              <option value="P4">P4 - Low</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-navy-700 dark:text-navy-300 mb-1">
            Due Date & Time
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="datetime-local"
              value={task.dueDate ? task.dueDate.toISOString().slice(0, 16) : ''}
              onChange={(e) => onEdit('dueDate', e.target.value ? new Date(e.target.value) : null)}
              className="input-field flex-1"
            />
            <span className="text-sm text-navy-500 dark:text-navy-400">
              {formatDueDate(task.dueDate)}
            </span>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-navy-200 dark:border-navy-700">
        <button
          onClick={onCancel}
          className="btn-secondary hover-scale"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="btn-primary hover-scale"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Create Task
        </button>
      </div>
    </div>
  );
};

export default TaskPreview;
