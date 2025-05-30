import React, { useState, useMemo } from 'react';
import { Task, TaskFilters } from '../types/Task';
import TaskCard from './TaskCard';
import TaskFiltersComponent from './TaskFilters';

interface TaskBoardProps {
  tasks: Task[];
  onTaskUpdate: (task: Task) => void;
  onTaskDelete: (id: string) => void;
}

const TaskBoard: React.FC<TaskBoardProps> = ({ tasks, onTaskUpdate, onTaskDelete }) => {
  const [filters, setFilters] = useState<TaskFilters>({});
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'createdAt' | 'source'>('dueDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const assignees = useMemo(() => {
    const uniqueAssignees = [...new Set(tasks.map(task => task.assignee))];
    return uniqueAssignees.filter(assignee => assignee !== 'Unassigned');
  }, [tasks]);

  const filteredAndSortedTasks = useMemo(() => {
    let filtered = tasks.filter(task => {
      if (filters.search && !task.name.toLowerCase().includes(filters.search.toLowerCase()) &&
          !task.assignee.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }
      if (filters.assignee && task.assignee !== filters.assignee) {
        return false;
      }
      if (filters.priority && task.priority !== filters.priority) {
        return false;
      }
      if (filters.source && task.source !== filters.source) {
        return false;
      }
      return true;
    });

    return filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'dueDate':
          const aDate = a.dueDate?.getTime() || Infinity;
          const bDate = b.dueDate?.getTime() || Infinity;
          comparison = aDate - bDate;
          break;
        case 'priority':
          const priorityOrder = { P1: 1, P2: 2, P3: 3, P4: 4 };
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
          break;
        case 'source':
          comparison = (a.source || 'manual').localeCompare(b.source || 'manual');
          break;
        case 'createdAt':
          comparison = a.createdAt.getTime() - b.createdAt.getTime();
          break;
      }
      
      return sortOrder === 'desc' ? -comparison : comparison;
    });
  }, [tasks, filters, sortBy, sortOrder]);

  const handleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const completedTasks = filteredAndSortedTasks.filter(task => task.completed);
  const activeTasks = filteredAndSortedTasks.filter(task => !task.completed);

  return (
    <div className="space-y-6 animate-fade-in">
      <TaskFiltersComponent
        filters={filters}
        onFiltersChange={setFilters}
        assignees={assignees}
      />
      
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold text-navy-900 dark:text-navy-100">
            Tasks ({filteredAndSortedTasks.length})
          </h2>
          {completedTasks.length > 0 && (
            <span className="text-sm text-navy-500 dark:text-navy-400">
              {completedTasks.length} completed
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2 overflow-x-auto pb-2">
          <span className="text-sm text-navy-600 dark:text-navy-400">Sort by:</span>
          <div className="flex space-x-1">
            {[
              { key: 'dueDate', label: 'Due Date' },
              { key: 'priority', label: 'Priority' },
              { key: 'source', label: 'Source' },
              { key: 'createdAt', label: 'Created' }
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => handleSort(key as typeof sortBy)}
                className={`px-3 py-1.5 text-sm rounded-lg transition-all duration-200 hover-scale ${
                  sortBy === key
                    ? 'bg-primary text-white'
                    : 'bg-navy-100 dark:bg-navy-700 text-navy-600 dark:text-navy-300 hover:bg-navy-200 dark:hover:bg-navy-600'
                }`}
              >
                {label}
                {sortBy === key && (
                  <span className="ml-1">
                    {sortOrder === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {activeTasks.length === 0 && completedTasks.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-navy-100 dark:bg-navy-800 flex items-center justify-center animate-pulse">
            <svg className="w-10 h-10 text-navy-400 dark:text-navy-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-navy-900 dark:text-navy-100 mb-2 animate-fade-in">
            No tasks found
          </h3>
          <p className="text-navy-500 dark:text-navy-400 animate-fade-in">
            {Object.keys(filters).some(key => filters[key as keyof TaskFilters])
              ? 'Try adjusting your filters or search terms.'
              : 'Create your first task using natural language above.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {activeTasks.map((task, index) => (
            <div key={task.id} style={{ animationDelay: `${index * 50}ms` }}>
              <TaskCard
                task={task}
                onUpdate={onTaskUpdate}
                onDelete={onTaskDelete}
              />
            </div>
          ))}
          
          {completedTasks.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-medium text-navy-700 dark:text-navy-300 mb-4 flex items-center">
                <span>Completed ({completedTasks.length})</span>
                <div className="flex-1 h-px bg-navy-200 dark:bg-navy-700 ml-4"></div>
              </h3>
              <div className="space-y-3">
                {completedTasks.map((task, index) => (
                  <div key={task.id} style={{ animationDelay: `${(index + activeTasks.length) * 50}ms` }}>
                    <TaskCard
                      task={task}
                      onUpdate={onTaskUpdate}
                      onDelete={onTaskDelete}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TaskBoard;
