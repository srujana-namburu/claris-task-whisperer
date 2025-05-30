
import React from 'react';
import { TaskFilters } from '../types/Task';

interface TaskFiltersProps {
  filters: TaskFilters;
  onFiltersChange: (filters: TaskFilters) => void;
  assignees: string[];
}

const TaskFiltersComponent: React.FC<TaskFiltersProps> = ({ filters, onFiltersChange, assignees }) => {
  const handleSearchChange = (search: string) => {
    onFiltersChange({ ...filters, search });
  };

  const handleAssigneeChange = (assignee: string) => {
    onFiltersChange({ ...filters, assignee: assignee || undefined });
  };

  const handlePriorityChange = (priority: string) => {
    onFiltersChange({ ...filters, priority: priority || undefined });
  };

  const handleSourceChange = (source: string) => {
    onFiltersChange({ ...filters, source: source || undefined });
  };

  return (
    <div className="bg-white dark:bg-navy-800 rounded-xl border border-navy-200 dark:border-navy-700 p-4 shadow-sm mb-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <input
              type="text"
              placeholder="Search tasks..."
              value={filters.search || ''}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="input-field pl-10 focus:ring-2 focus:ring-primary-light focus:border-transparent transition-all duration-300"
            />
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-navy-400 dark:text-navy-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        
        <div className="flex gap-3 flex-wrap sm:flex-nowrap">
          <select
            value={filters.assignee || ''}
            onChange={(e) => handleAssigneeChange(e.target.value)}
            className="input-field min-w-0 sm:min-w-[120px] hover-scale"
          >
            <option value="">All Assignees</option>
            {assignees.map(assignee => (
              <option key={assignee} value={assignee}>{assignee}</option>
            ))}
          </select>
          
          <select
            value={filters.priority || ''}
            onChange={(e) => handlePriorityChange(e.target.value)}
            className="input-field min-w-0 sm:min-w-[120px] hover-scale"
          >
            <option value="">All Priorities</option>
            <option value="P1">P1 - Urgent</option>
            <option value="P2">P2 - High</option>
            <option value="P3">P3 - Medium</option>
            <option value="P4">P4 - Low</option>
          </select>
          
          <select
            value={filters.source || ''}
            onChange={(e) => handleSourceChange(e.target.value)}
            className="input-field min-w-0 sm:min-w-[120px] hover-scale"
          >
            <option value="">All Sources</option>
            <option value="manual">Manual Entry</option>
            <option value="transcript">Meeting Minutes</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default TaskFiltersComponent;
