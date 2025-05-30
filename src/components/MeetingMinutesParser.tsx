
import React, { useState } from 'react';
import { BatchParsedTask } from '../types/Task';
import { parseMeetingTranscript } from '../utils/taskParser';

interface MeetingMinutesParserProps {
  onTasksExtracted: (tasks: BatchParsedTask[]) => void;
  useGPT: boolean;
}

const MeetingMinutesParser: React.FC<MeetingMinutesParserProps> = ({ onTasksExtracted, useGPT }) => {
  const [transcript, setTranscript] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [extractedTasks, setExtractedTasks] = useState<BatchParsedTask[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  const handleExtractTasks = async () => {
    if (!transcript.trim()) return;

    setIsLoading(true);
    
    try {
      // For now, we'll use our basic parser regardless of GPT toggle
      // In a real implementation, this would call the Gemini API when useGPT is true
      const tasks = parseMeetingTranscript(transcript);
      setExtractedTasks(tasks);
      setShowPreview(tasks.length > 0);
    } catch (error) {
      console.error('Error parsing transcript:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectTask = (id: string, selected: boolean) => {
    setExtractedTasks(prev => prev.map(task => 
      task.id === id ? { ...task, selected } : task
    ));
  };

  const handleAddTasks = () => {
    const selectedTasks = extractedTasks.filter(task => task.selected);
    onTasksExtracted(selectedTasks);
    setTranscript('');
    setExtractedTasks([]);
    setShowPreview(false);
  };

  const handleSelectAll = () => {
    setExtractedTasks(prev => prev.map(task => ({ ...task, selected: true })));
  };

  const handleDeselectAll = () => {
    setExtractedTasks(prev => prev.map(task => ({ ...task, selected: false })));
  };

  return (
    <div className="bg-white dark:bg-navy-800 rounded-xl border border-navy-200 dark:border-navy-700 p-6 shadow-sm mb-8 animate-fade-in">
      <div className="mb-6">
        <label htmlFor="transcript-input" className="block text-sm font-medium text-navy-700 dark:text-navy-300 mb-2">
          Meeting Minutes to Tasks Converter
        </label>
        <textarea
          id="transcript-input"
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder="Paste your meeting transcript here (e.g., 'Aman you take the landing page by 10pm tomorrow. Rajeev you take care of client follow-up by Wednesday.')"
          className="input-field resize-none h-32"
          disabled={isLoading || showPreview}
        />
      </div>
      
      <div className="flex justify-end">
        {showPreview ? (
          <button
            onClick={() => setShowPreview(false)}
            className="btn-secondary hover-scale mr-3"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
            </svg>
            Back to Edit
          </button>
        ) : (
          <button
            onClick={handleExtractTasks}
            disabled={!transcript.trim() || isLoading}
            className="btn-primary hover-scale disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Extracting...</span>
              </div>
            ) : (
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Extract Tasks from Transcript
              </span>
            )}
          </button>
        )}
      </div>

      {showPreview && (
        <div className="mt-8 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-navy-900 dark:text-navy-100">
              Extracted Tasks ({extractedTasks.length})
            </h3>
            <div className="flex space-x-3">
              <button
                onClick={handleSelectAll}
                className="text-sm text-primary hover:text-primary-light transition-colors duration-200"
              >
                Select All
              </button>
              <button
                onClick={handleDeselectAll}
                className="text-sm text-navy-500 dark:text-navy-400 hover:text-navy-800 dark:hover:text-navy-200 transition-colors duration-200"
              >
                Deselect All
              </button>
            </div>
          </div>
          
          {extractedTasks.length === 0 ? (
            <div className="text-center py-8 bg-navy-50 dark:bg-navy-900/50 rounded-lg">
              <p className="text-navy-500 dark:text-navy-400">No tasks could be extracted from the transcript.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {extractedTasks.map((task, index) => (
                <div 
                  key={task.id}
                  className={`bg-white dark:bg-navy-800 border rounded-lg p-4 hover:shadow-md transition-all duration-300 animate-fade-in ${
                    task.selected 
                      ? 'border-primary dark:border-primary-light' 
                      : 'border-navy-200 dark:border-navy-700'
                  }`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-start">
                    <div className="mr-3 mt-1">
                      <input
                        type="checkbox"
                        checked={task.selected}
                        onChange={(e) => handleSelectTask(task.id, e.target.checked)}
                        className="w-4 h-4 text-primary bg-white dark:bg-navy-700 border-navy-300 dark:border-navy-600 rounded focus:ring-primary"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-navy-900 dark:text-navy-100 font-medium">
                        {task.name}
                      </h4>
                      <div className="flex flex-wrap items-center mt-2 text-sm gap-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                          {task.assignee}
                        </span>
                        <span className="text-navy-500 dark:text-navy-400">
                          {task.dueDate ? formatDueDate(task.dueDate) : 'No due date'}
                        </span>
                        <div className="flex items-center">
                          <div className={`priority-dot ${
                            task.priority === 'P1' ? 'priority-p1' :
                            task.priority === 'P2' ? 'priority-p2' :
                            task.priority === 'P3' ? 'priority-p3' : 'priority-p4'
                          }`}></div>
                          <span className="ml-1 text-xs text-navy-500 dark:text-navy-400">
                            {task.priority}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {extractedTasks.length > 0 && (
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleAddTasks}
                disabled={!extractedTasks.some(t => t.selected)}
                className="btn-primary hover-scale disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Selected Tasks ({extractedTasks.filter(t => t.selected).length})
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MeetingMinutesParser;
