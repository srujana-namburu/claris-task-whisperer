
import { ParsedTask, BatchParsedTask } from '../types/Task';

export const parseNaturalLanguageTask = (input: string, source: 'manual' | 'transcript' = 'manual'): ParsedTask => {
  const normalizedInput = input.toLowerCase();
  let taskName = input.trim();
  let assignee = 'Unassigned';
  let dueDate: Date | null = null;
  let priority: 'P1' | 'P2' | 'P3' | 'P4' = 'P3';

  // Extract priority first
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

  // Enhanced assignee patterns with better order and exclusions
  const assigneePatterns = [
    /\b([A-Za-z]+)\s+(you\s+)?(take|handle|do|work\s+on|complete|finish)/i,
    /\b([A-Za-z]+)\s+(should|will|needs?\s+to|must)\s+/i,
    /\b([A-Za-z]+)\s+is\s+(responsible\s+for|assigned\s+to|handling)/i,
    /\bassign(?:ed)?\s+to\s+([A-Za-z]+)/i,
    /\bfor\s+([A-Za-z]+)(?:\s+by|\s+due|\s+to|\s*$)/i,
    /\b@([A-Za-z]+)/i,
    /\b([A-Za-z]+)\s+by\s+\d/i,
    /\b([A-Za-z]+)\s+(tomorrow|today|tonight)/i,
  ];

  for (const pattern of assigneePatterns) {
    const match = input.match(pattern);
    if (match && match[1]) {
      const potentialAssignee = match[1].trim();
      const excludeWords = ['finish', 'complete', 'work', 'task', 'project', 'make', 'create', 'build', 'develop', 'design', 'update', 'fix', 'review', 'test', 'send', 'call', 'email', 'meet'];
      if (!excludeWords.includes(potentialAssignee.toLowerCase()) && potentialAssignee.length > 1) {
        assignee = potentialAssignee.charAt(0).toUpperCase() + potentialAssignee.slice(1).toLowerCase();
        taskName = taskName.replace(new RegExp(match[0], 'gi'), '').trim();
        break;
      }
    }
  }

  // Enhanced due date and time patterns
  const dateTimePatterns = [
    // Date with time patterns
    /\bby\s+(\d{1,2})(st|nd|rd|th)?\s+(january|february|march|april|may|june|july|august|september|october|november|december)\s+at\s+(\d{1,2}):?(\d{2})?\s*(am|pm)/i,
    /\bby\s+(\d{1,2})\/(\d{1,2})\/(\d{2,4})\s+at\s+(\d{1,2}):?(\d{2})?\s*(am|pm)/i,
    /\bby\s+(\d{1,2})\/(\d{1,2})\s+at\s+(\d{1,2}):?(\d{2})?\s*(am|pm)/i,
    
    // Tomorrow/today with time
    /\b(tomorrow)\s+(?:at\s+)?(\d{1,2}):?(\d{2})?\s*(am|pm)/i,
    /\b(today)\s+(?:at\s+)?(\d{1,2}):?(\d{2})?\s*(am|pm)/i,
    /\b(tonight)\s+(?:at\s+)?(\d{1,2}):?(\d{2})?\s*(am|pm)?/i,
    
    // Day names with time
    /\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\s+(?:at\s+)?(\d{1,2}):?(\d{2})?\s*(am|pm)/i,
    
    // Time with "by" prefix
    /\bby\s+(\d{1,2}):?(\d{2})?\s*(am|pm)/i,
    
    // Standalone time patterns
    /\bat\s+(\d{1,2}):?(\d{2})?\s*(am|pm)/i,
    /\b(\d{1,2}):(\d{2})\s*(am|pm)/i,
    /\b(\d{1,2})\s*(am|pm)/i,
    
    // Date only patterns
    /\bby\s+(\d{1,2})(st|nd|rd|th)?\s+(january|february|march|april|may|june|july|august|september|october|november|december)/i,
    /\bby\s+(\d{1,2})\/(\d{1,2})\/(\d{2,4})/,
    /\bby\s+(\d{1,2})\/(\d{1,2})/,
    /\b(tomorrow)/i,
    /\b(today)/i,
    /\b(tonight)/i,
    /\bnext\s+(week|monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i,
    /\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i,
  ];

  for (const pattern of dateTimePatterns) {
    const match = input.match(pattern);
    if (match) {
      try {
        const matchText = match[0].toLowerCase();
        
        if (matchText.includes('tomorrow')) {
          dueDate = new Date();
          dueDate.setDate(dueDate.getDate() + 1);
          if (match[2]) {
            let hours = parseInt(match[2]);
            const minutes = match[3] ? parseInt(match[3]) : 0;
            const ampm = match[4]?.toLowerCase();
            if (ampm === 'pm' && hours !== 12) hours += 12;
            if (ampm === 'am' && hours === 12) hours = 0;
            dueDate.setHours(hours, minutes, 0, 0);
          }
        } else if (matchText.includes('today')) {
          dueDate = new Date();
          if (match[2]) {
            let hours = parseInt(match[2]);
            const minutes = match[3] ? parseInt(match[3]) : 0;
            const ampm = match[4]?.toLowerCase();
            if (ampm === 'pm' && hours !== 12) hours += 12;
            if (ampm === 'am' && hours === 12) hours = 0;
            dueDate.setHours(hours, minutes, 0, 0);
          }
        } else if (matchText.includes('tonight')) {
          dueDate = new Date();
          if (match[2]) {
            let hours = parseInt(match[2]);
            const minutes = match[3] ? parseInt(match[3]) : 0;
            const ampm = match[4]?.toLowerCase();
            if (ampm === 'pm' && hours !== 12) hours += 12;
            if (ampm === 'am' && hours === 12) hours = 0;
            dueDate.setHours(hours, minutes, 0, 0);
          } else {
            dueDate.setHours(20, 0, 0, 0);
          }
        } else {
          // Handle day names
          const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
          const dayIndex = dayNames.findIndex(day => matchText.includes(day));
          if (dayIndex !== -1) {
            dueDate = new Date();
            const currentDay = dueDate.getDay();
            const daysUntilTarget = (dayIndex - currentDay + 7) % 7;
            dueDate.setDate(dueDate.getDate() + (daysUntilTarget === 0 ? 7 : daysUntilTarget));
            
            if (match[2]) {
              let hours = parseInt(match[2]);
              const minutes = match[3] ? parseInt(match[3]) : 0;
              const ampm = match[4]?.toLowerCase();
              if (ampm === 'pm' && hours !== 12) hours += 12;
              if (ampm === 'am' && hours === 12) hours = 0;
              dueDate.setHours(hours, minutes, 0, 0);
            }
          } else if (match[1] && (match[3] || match[4])) {
            // Handle standalone time patterns
            dueDate = new Date();
            let hours = parseInt(match[1]);
            const minutes = match[2] ? parseInt(match[2]) : 0;
            const ampm = match[3]?.toLowerCase();
            if (ampm === 'pm' && hours !== 12) hours += 12;
            if (ampm === 'am' && hours === 12) hours = 0;
            dueDate.setHours(hours, minutes, 0, 0);
          }
        }
      } catch {
        dueDate = null;
      }
      taskName = taskName.replace(new RegExp(match[0], 'gi'), '').trim();
      break;
    }
  }

  // Clean up task name more thoroughly
  taskName = taskName
    .replace(/\s+/g, ' ')
    .replace(/^(the|a|an)\s+/i, '')
    .replace(/\b(by|for|at|to|and|or|with)\s*$/i, '')
    .replace(/^(and|or|also|then|next)\s+/i, '')
    .trim();
  
  // If task name is still poor, try to extract meaningful content
  if (taskName.length < 5) {
    const actionPatterns = [
      /\b(complete|finish|work\s+on|develop|create|build|design|implement|fix|update|review|test|send|call|email|meet)\s+([^.!?]*)/i,
      /\b(make|do|handle|prepare|setup|configure)\s+([^.!?]*)/i,
    ];
    
    for (const pattern of actionPatterns) {
      const match = input.match(pattern);
      if (match && match[0]) {
        taskName = match[0];
        break;
      }
    }
  }
  
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
  
  // Split by multiple delimiters and clean up
  const sentences = transcript
    .replace(/\.\s+/g, '.|')
    .replace(/\!\s+/g, '!|')
    .replace(/\?\s+/g, '?|')
    .replace(/\;\s+/g, ';|')
    .replace(/\,\s+and\s+/g, ', and|')
    .replace(/\,\s+also\s+/g, ', also|')
    .split('|')
    .map(s => s.trim())
    .filter(s => s.length > 5);

  // Enhanced task indicator patterns for meeting transcripts
  const taskIndicators = [
    /\b([A-Za-z]+)\s+(you\s+)?(take|handle|do|work\s+on|complete|finish|develop|create|build|design)/i,
    /\b([A-Za-z]+)\s+(will|should|needs?\s+to|is\s+responsible\s+for|takes?\s+care\s+of)/i,
    /\b([A-Za-z]+)\s+please\s+(work\s+on|handle|take\s+care\s+of|complete)/i,
    /\bassign\s+([^.!?]*)\s+to\s+([A-Za-z]+)/i,
    /\b([A-Za-z]+)\s+(by\s+\w+)/i,
    /\b([A-Za-z]+)\s+(?:can|could)\s+(?:you\s+)?(handle|take|do|work)/i,
  ];

  sentences.forEach((sentence, index) => {
    const hasTaskIndicator = taskIndicators.some(pattern => pattern.test(sentence));
    const hasAssignment = /\b([A-Za-z]+)\s+(you\s+)?(take|handle|do|work|complete|finish|by)/i.test(sentence);
    
    if (hasTaskIndicator || hasAssignment || sentence.toLowerCase().includes('by ')) {
      try {
        const parsedTask = parseNaturalLanguageTask(sentence, 'transcript');
        
        // Improve task name extraction for meeting context
        if (parsedTask.name.length < 8 || parsedTask.name === 'New Task') {
          let improvedName = sentence;
          
          // Remove assignee mentions
          if (parsedTask.assignee !== 'Unassigned') {
            const assigneePattern = new RegExp(`\\b${parsedTask.assignee}\\s+(you\\s+)?(take|handle|do|work\\s+on|will|should)`, 'gi');
            improvedName = improvedName.replace(assigneePattern, '');
          }
          
          // Remove common meeting phrases
          improvedName = improvedName
            .replace(/\b(you\s+)?(take|handle|do|work\s+on|complete|finish)/gi, '')
            .replace(/\b(will|should|needs?\s+to|please)/gi, '')
            .replace(/\bby\s+\w+/gi, '')
            .replace(/\bat\s+\d+/gi, '')
            .trim();
          
          if (improvedName.length > 5) {
            parsedTask.name = improvedName.charAt(0).toUpperCase() + improvedName.slice(1);
          }
        }
        
        // Only add if we have meaningful content
        if (parsedTask.assignee !== 'Unassigned' || parsedTask.name.length > 8) {
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
