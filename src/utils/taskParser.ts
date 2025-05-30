
import { ParsedTask } from '../types/Task';

export const parseNaturalLanguageTask = (input: string): ParsedTask => {
  const normalizedInput = input.toLowerCase();
  
  // Extract task name (everything before assignee patterns)
  let taskName = input.trim();
  let assignee = 'Unassigned';
  let dueDate: Date | null = null;
  let priority: 'P1' | 'P2' | 'P3' | 'P4' = 'P3';

  // Extract priority
  const priorityMatch = normalizedInput.match(/\b(p[1-4]|priority\s*[1-4])\b/);
  if (priorityMatch) {
    const p = priorityMatch[1].replace(/priority\s*/, '').toUpperCase();
    priority = p as 'P1' | 'P2' | 'P3' | 'P4';
    taskName = taskName.replace(new RegExp(priorityMatch[0], 'gi'), '').trim();
  }

  // Extract assignee (common patterns)
  const assigneePatterns = [
    /\bfor\s+([A-Za-z]+)/,
    /\bby\s+([A-Za-z]+)/,
    /\b([A-Za-z]+)\s+by\s+/,
    /\bassign\s+to\s+([A-Za-z]+)/,
    /\b@([A-Za-z]+)/,
  ];

  for (const pattern of assigneePatterns) {
    const match = normalizedInput.match(pattern);
    if (match) {
      assignee = match[1].charAt(0).toUpperCase() + match[1].slice(1);
      taskName = taskName.replace(new RegExp(match[0], 'gi'), '').trim();
      break;
    }
  }

  // Extract due date
  const datePatterns = [
    /\bby\s+(\d{1,2})(st|nd|rd|th)?\s+(january|february|march|april|may|june|july|august|september|october|november|december|\w{3})/i,
    /\bby\s+(\d{1,2})\/(\d{1,2})\/(\d{2,4})/,
    /\bby\s+(\d{1,2})\/(\d{1,2})/,
    /\b(tomorrow)/i,
    /\b(today)/i,
    /\bnext\s+(week|monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i,
    /\b(\d{1,2})(st|nd|rd|th)?\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i,
  ];

  for (const pattern of datePatterns) {
    const match = input.match(pattern);
    if (match) {
      try {
        if (match[0].toLowerCase().includes('tomorrow')) {
          dueDate = new Date();
          dueDate.setDate(dueDate.getDate() + 1);
        } else if (match[0].toLowerCase().includes('today')) {
          dueDate = new Date();
        } else if (match[0].toLowerCase().includes('next week')) {
          dueDate = new Date();
          dueDate.setDate(dueDate.getDate() + 7);
        } else {
          // Try to parse the date
          dueDate = new Date(match[0].replace(/by\s+/i, ''));
          if (isNaN(dueDate.getTime())) {
            dueDate = null;
          }
        }
      } catch {
        dueDate = null;
      }
      taskName = taskName.replace(new RegExp(match[0], 'gi'), '').trim();
      break;
    }
  }

  // Extract time
  const timeMatch = input.match(/\b(\d{1,2}):?(\d{2})?\s*(am|pm|AM|PM)\b/);
  if (timeMatch && dueDate) {
    let hours = parseInt(timeMatch[1]);
    const minutes = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
    const ampm = timeMatch[3].toLowerCase();
    
    if (ampm === 'pm' && hours !== 12) hours += 12;
    if (ampm === 'am' && hours === 12) hours = 0;
    
    dueDate.setHours(hours, minutes, 0, 0);
    taskName = taskName.replace(timeMatch[0], '').trim();
  }

  // Clean up task name
  taskName = taskName.replace(/\s+/g, ' ').trim();
  
  return {
    name: taskName || 'New Task',
    assignee,
    dueDate,
    priority
  };
};

export const formatDueDate = (date: Date | null): string => {
  if (!date) return 'No due date';
  
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const taskDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffTime = taskDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  if (diffDays === 0) return `Today at ${timeStr}`;
  if (diffDays === 1) return `Tomorrow at ${timeStr}`;
  if (diffDays === -1) return `Yesterday at ${timeStr}`;
  if (diffDays > 1 && diffDays <= 7) return `In ${diffDays} days at ${timeStr}`;
  if (diffDays < -1 && diffDays >= -7) return `${Math.abs(diffDays)} days ago at ${timeStr}`;
  
  return date.toLocaleDateString() + ' at ' + timeStr;
};
