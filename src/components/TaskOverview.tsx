
import React from 'react';
import { Task } from '../types/Task';
import { Calendar, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

interface TaskOverviewProps {
  tasks: Task[];
}

const TaskOverview: React.FC<TaskOverviewProps> = ({ tasks }) => {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.completed).length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const dueTodayTasks = tasks.filter(task => {
    if (!task.dueDate || task.completed) return false;
    const taskDate = new Date(task.dueDate);
    taskDate.setHours(0, 0, 0, 0);
    return taskDate.getTime() === today.getTime();
  }).length;
  
  const overdueTasks = tasks.filter(task => {
    if (!task.dueDate || task.completed) return false;
    const taskDate = new Date(task.dueDate);
    taskDate.setHours(0, 0, 0, 0);
    return taskDate.getTime() < today.getTime();
  }).length;

  const stats = [
    {
      title: 'Total Tasks',
      value: totalTasks,
      icon: Calendar,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      borderColor: 'border-blue-200 dark:border-blue-800'
    },
    {
      title: 'Completed',
      value: completedTasks,
      icon: CheckCircle,
      color: 'bg-green-500',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      borderColor: 'border-green-200 dark:border-green-800'
    },
    {
      title: 'Due Today',
      value: dueTodayTasks,
      icon: Clock,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      borderColor: 'border-orange-200 dark:border-orange-800'
    },
    {
      title: 'Overdue',
      value: overdueTasks,
      icon: AlertTriangle,
      color: 'bg-red-500',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      borderColor: 'border-red-200 dark:border-red-800'
    }
  ];

  return (
    <div className="mb-8 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-navy-900 dark:text-navy-100">
          Task Overview
        </h2>
        <div className="flex items-center space-x-3">
          <span className="text-sm text-navy-600 dark:text-navy-400">Completion Rate</span>
          <div className="flex items-center space-x-2">
            <div className="w-24 h-2 bg-navy-200 dark:bg-navy-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary to-primary-light transition-all duration-500 ease-out"
                style={{ width: `${completionRate}%` }}
              />
            </div>
            <span className="text-lg font-bold text-primary">{completionRate}%</span>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div 
              key={stat.title}
              className={`${stat.bgColor} ${stat.borderColor} border rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover-scale animate-fade-in`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.color} p-3 rounded-lg shadow-md`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              
              <div className="space-y-1">
                <p className="text-3xl font-bold text-navy-900 dark:text-navy-100">
                  {stat.value}
                </p>
                <p className="text-sm font-medium text-navy-600 dark:text-navy-400">
                  {stat.title}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TaskOverview;
