
import { ParsedTask, BatchParsedTask } from '../types/Task';

export const parseNaturalLanguageTask = (input: string, source: 'manual' | 'transcript' = 'manual'): ParsedTask => {
  const normalizedInput = input.toLowerCase();
  
  // Extract task name (everything before assignee patterns)
  let taskName = input.trim();
  let assignee = 'Unassigned';
  let dueDate: Date | null = null;
  let priority: 'P1' | 'P2' | 'P3' | 'P4' = 'P3';

  // Extract priority
  const priorityMatch = normalizedInput.match(/\b(p[1-4]|priority\s*[1-4]|urgent|high|medium|low)\b/);
  if (priorityMatch) {
    const p = priorityMatch[1];
    if (p.includes('urgent') || p.includes('p1')) priority = 'P1';
    else if (p.includes('high') || p.includes('p2')) priority = 'P2';
    else if (p.includes('medium') || p.includes('p3')) priority = 'P3';
    else if (p.includes('low') || p.includes('p4')) priority = 'P4';
    else priority = p.replace(/priority\s*/, '').toUpperCase() as 'P1' | 'P2' | 'P3' | 'P4';
    
    taskName = taskName.replace(new RegExp(priorityMatch[0], 'gi'), '').trim();
  }

  // Extract assignee (enhanced patterns for meeting transcripts)
  const assigneePatterns = [
    /\b([A-Za-z]+)\s+you\s+take/i,
    /\b([A-Za-z]+)\s+will\s+handle/i,
    /\b([A-Za-z]+)\s+should\s+do/i,
    /\b([A-Za-z]+)\s+is\s+responsible/i,
    /\bfor\s+([A-Za-z]+)/i,
    /\bby\s+([A-Za-z]+)(?!\s+\d)/i,
    /\b([A-Za-z]+)\s+by\s+/i,
    /\bassign\s+to\s+([A-Za-z]+)/i,
    /\b@([A-Za-z]+)/i,
    /\b([A-Za-z]+)\s+takes?\s+care/i,
    /\b([A-Za-z]+)\s+please/i,
  ];

  for (const pattern of assigneePatterns) {
    const match = input.match(pattern);
    if (match) {
      assignee = match[1].charAt(0).toUpperCase() + match[1].slice(1);
      taskName = taskName.replace(new RegExp(match[0], 'gi'), '').trim();
      break;
    }
  }

  // Extract due date (enhanced patterns)
  const datePatterns = [
    /\bby\s+(\d{1,2})(st|nd|rd|th)?\s+(january|february|march|april|may|june|july|august|september|october|november|december|\w{3})/i,
    /\bby\s+(\d{1,2})\/(\d{1,2})\/(\d{2,4})/,
    /\bby\s+(\d{1,2})\/(\d{1,2})/,
    /\b(tomorrow)/i,
    /\b(today)/i,
    /\b(tonight)/i,
    /\bnext\s+(week|monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i,
    /\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i,
    /\b(\d{1,2})(st|nd|rd|th)?\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i,
    /\bby\s+end\s+of\s+(week|month)/i,
  ];

  for (const pattern of datePatterns) {
    const match = input.match(pattern);
    if (match) {
      try {
        const matchText = match[0].toLowerCase();
        
        if (matchText.includes('tomorrow')) {
          dueDate = new Date();
          dueDate.setDate(dueDate.getDate() + 1);
        } else if (matchText.includes('today')) {
          dueDate = new Date();
        } else if (matchText.includes('tonight')) {
          dueDate = new Date();
          dueDate.setHours(20, 0, 0, 0); // Default to 8 PM
        } else if (matchText.includes('next week')) {
          dueDate = new Date();
          dueDate.setDate(dueDate.getDate() + 7);
        } else if (matchText.includes('end of week')) {
          dueDate = new Date();
          const daysUntilFriday = (5 - dueDate.getDay() + 7) % 7;
          dueDate.setDate(dueDate.getDate() + daysUntilFriday);
        } else {
          // Handle day names
          const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
          const dayIndex = dayNames.findIndex(day => matchText.includes(day));
          if (dayIndex !== -1) {
            dueDate = new Date();
            const currentDay = dueDate.getDay();
            const daysUntilTarget = (dayIndex - currentDay + 7) % 7;
            dueDate.setDate(dueDate.getDate() + (daysUntilTarget === 0 ? 7 : daysUntilTarget));
          } else {
            // Try to parse the date
            dueDate = new Date(match[0].replace(/by\s+/i, ''));
            if (isNaN(dueDate.getTime())) {
              dueDate = null;
            }
          }
        }
      } catch {
        dueDate = null;
      }
      taskName = taskName.replace(new RegExp(match[0], 'gi'), '').trim();
      break;
    }
  }

  // Extract time (enhanced)
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
  taskName = taskName
    .replace(/\s+/g, ' ')
    .replace(/^(the|a|an)\s+/i, '')
    .trim();
  
  return {
    name: taskName || 'New Task',
    assignee,
    dueDate,
    priority,
    source
  };
};

export const parseMeetingTranscript = (transcript: string): BatchParsedTask[] => {
  const tasks: BatchParsedTask[] = [];
  
  // Split transcript into sentences and potential task statements
  const sentences = transcript
    .split(/[.!?]/)
    .map(s => s.trim())
    .filter(s => s.length > 10);

  // Task indicator patterns
  const taskIndicators = [
    /\b(you\s+take|you\s+handle|you\s+do|you\s+work\s+on)/i,
    /\b(will\s+handle|should\s+do|is\s+responsible|takes?\s+care)/i,
    /\b(please\s+work\s+on|can\s+you|need\s+you\s+to)/i,
    /\b(assign|task|action\s+item)/i,
  ];

  sentences.forEach((sentence, index) => {
    // Check if sentence contains task indicators
    const hasTaskIndicator = taskIndicators.some(pattern => pattern.test(sentence));
    
    if (hasTaskIndicator || sentence.toLowerCase().includes('by ')) {
      try {
        const parsedTask = parseNaturalLanguageTask(sentence, 'transcript');
        
        // Only add if we found a meaningful assignee or task name
        if (parsedTask.assignee !== 'Unassigned' || parsedTask.name.length > 5) {
          tasks.push({
            ...parsedTask,
            selected: true,
            id: crypto.randomUUID()
          });
        }
      } catch (error) {
        console.error('Error parsing sentence:', sentence, error);
      }
    }
  });

  return tasks;
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
