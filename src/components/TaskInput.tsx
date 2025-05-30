
import React, { useState } from 'react';
import { parseNaturalLanguageTask } from '../utils/taskParser';
import { ParsedTask } from '../types/Task';
import TaskPreview from './TaskPreview';

interface TaskInputProps {
  onTaskCreate: (task: ParsedTask) => void;
}

const TaskInput: React.FC<TaskInputProps> = ({ onTaskCreate }) => {
  const [input, setInput] = useState('');
  const [useGPT, setUseGPT] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewTask, setPreviewTask] = useState<ParsedTask | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setIsLoading(true);
    
    try {
      // For now, we'll use our basic parser regardless of GPT toggle
      // In a real implementation, this would call the Gemini API when useGPT is true
      const parsedTask = parseNaturalLanguageTask(input, 'manual');
      setPreviewTask(parsedTask);
      setShowPreview(true);
    } catch (error) {
      console.error('Error parsing task:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmTask = () => {
    if (previewTask) {
      onTaskCreate(previewTask);
      setInput('');
      setShowPreview(false);
      setPreviewTask(null);
    }
  };

  const handleEditTask = (field: string, value: any) => {
    if (previewTask) {
      setPreviewTask({
        ...previewTask,
        [field]: value
      });
    }
  };

  const handleCancelPreview = () => {
    setShowPreview(false);
    setPreviewTask(null);
  };

  return (
    <div className="bg-white dark:bg-navy-800 rounded-xl border border-navy-200 dark:border-navy-700 p-6 shadow-sm mb-8 animate-fade-in">
      {showPreview && previewTask ? (
        <TaskPreview 
          task={previewTask}
          onConfirm={handleConfirmTask}
          onEdit={handleEditTask}
          onCancel={handleCancelPreview}
        />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="task-input" className="block text-sm font-medium text-navy-700 dark:text-navy-300 mb-2">
              Create New Task
            </label>
            <textarea
              id="task-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter task in natural language (e.g., 'Finish landing page for Aman by 11pm 20th June')"
              className="input-field resize-none h-24 focus:ring-2 focus:ring-primary-light focus:border-transparent transition-all duration-300"
              disabled={isLoading}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useGPT}
                  onChange={(e) => setUseGPT(e.target.checked)}
                  className="w-4 h-4 text-primary-light bg-white dark:bg-navy-700 border-navy-300 dark:border-navy-600 rounded focus:ring-primary-light focus:ring-2"
                  disabled={isLoading}
                />
                <span className="text-sm text-navy-600 dark:text-navy-400">
                  Use GPT for enhanced parsing
                </span>
              </label>
              
              {useGPT && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                  Enhanced
                </span>
              )}
            </div>
            
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="btn-primary hover-scale disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Creating...</span>
                </div>
              ) : (
                'Create Task'
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default TaskInput;
