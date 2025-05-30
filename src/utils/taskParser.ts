
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

  // Enhanced assignee patterns - order matters for better matching
  const assigneePatterns = [
    /\b([A-Za-z]+)\s+you\s+(take|handle|do|work\s+on|complete)/i,
    /\b([A-Za-z]+)\s+(please|should|will|needs?\s+to)\s+/i,
    /\b([A-Za-z]+)\s+is\s+responsible\s+for/i,
    /\b([A-Za-z]+)\s+takes?\s+care\s+of/i,
    /\bassign\s+to\s+([A-Za-z]+)/i,
    /\bfor\s+([A-Za-z]+)(?:\s+by|\s+due|\s*$)/i,
    /\b@([A-Za-z]+)/i,
    /\b([A-Za-z]+)\s+by\s+\d/i, // Name followed by "by" and a date
    /\b([A-Za-z]+)\s+tomorrow/i,
    /\b([A-Za-z]+)\s+(today|tonight)/i,
  ];

  for (const pattern of assigneePatterns) {
    const match = input.match(pattern);
    if (match && match[1]) {
      const potentialAssignee = match[1].trim();
      // Exclude common words that aren't names
      const excludeWords = ['finish', 'complete', 'work', 'task', 'project', 'make', 'create', 'build', 'develop', 'design'];
      if (!excludeWords.includes(potentialAssignee.toLowerCase()) && potentialAssignee.length > 1) {
        assignee = potentialAssignee.charAt(0).toUpperCase() + potentialAssignee.slice(1).toLowerCase();
        taskName = taskName.replace(new RegExp(match[0], 'gi'), '').trim();
        break;
      }
    }
  }

  // Enhanced due date patterns
  const datePatterns = [
    /\bby\s+(\d{1,2})(st|nd|rd|th)?\s+(january|february|march|april|may|june|july|august|september|october|november|december)/i,
    /\bby\s+(\d{1,2})\/(\d{1,2})\/(\d{2,4})/,
    /\bby\s+(\d{1,2})\/(\d{1,2})/,
    /\b(tomorrow)(?:\s+at\s+(\d{1,2}):?(\d{2})?\s*(am|pm)?)?/i,
    /\b(today)(?:\s+at\s+(\d{1,2}):?(\d{2})?\s*(am|pm)?)?/i,
    /\b(tonight)/i,
    /\bnext\s+(week|monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i,
    /\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)(?:\s+at\s+(\d{1,2}):?(\d{2})?\s*(am|pm)?)?/i,
    /\b(\d{1,2})(st|nd|rd|th)?\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i,
    /\bby\s+end\s+of\s+(week|month)/i,
    /\bat\s+(\d{1,2}):?(\d{2})?\s*(am|pm)/i,
  ];

  for (const pattern of datePatterns) {
    const match = input.match(pattern);
    if (match) {
      try {
        const matchText = match[0].toLowerCase();
        
        if (matchText.includes('tomorrow')) {
          dueDate = new Date();
          dueDate.setDate(dueDate.getDate() + 1);
          // Extract time if present
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
          dueDate.setHours(20, 0, 0, 0);
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
            
            // Extract time if present
            if (match[2]) {
              let hours = parseInt(match[2]);
              const minutes = match[3] ? parseInt(match[3]) : 0;
              const ampm = match[4]?.toLowerCase();
              if (ampm === 'pm' && hours !== 12) hours += 12;
              if (ampm === 'am' && hours === 12) hours = 0;
              dueDate.setHours(hours, minutes, 0, 0);
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

  // Extract standalone time patterns if no date was found but time exists
  if (!dueDate) {
    const timeMatch = input.match(/\b(\d{1,2}):?(\d{2})?\s*(am|pm|AM|PM)\b/);
    if (timeMatch) {
      dueDate = new Date();
      let hours = parseInt(timeMatch[1]);
      const minutes = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
      const ampm = timeMatch[3].toLowerCase();
      
      if (ampm === 'pm' && hours !== 12) hours += 12;
      if (ampm === 'am' && hours === 12) hours = 0;
      
      dueDate.setHours(hours, minutes, 0, 0);
      taskName = taskName.replace(timeMatch[0], '').trim();
    }
  }

  // Clean up task name
  taskName = taskName
    .replace(/\s+/g, ' ')
    .replace(/^(the|a|an)\s+/i, '')
    .replace(/\bby\s*$/i, '')
    .replace(/\bfor\s*$/i, '')
    .trim();
  
  // If task name is too short or generic, try to extract a meaningful action
  if (taskName.length < 3) {
    const actionPatterns = [
      /\b(complete|finish|work\s+on|develop|create|build|design|implement|fix|update|review|test)\s+([^.!?]*)/i,
    ];
    
    for (const pattern of actionPatterns) {
      const match = input.match(pattern);
      if (match && match[2]) {
        taskName = match[1] + ' ' + match[2];
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
  
  // Enhanced sentence splitting to better handle meeting transcripts
  const sentences = transcript
    .replace(/\./g, '.|')
    .replace(/\!/g, '!|')
    .replace(/\?/g, '?|')
    .split('|')
    .map(s => s.trim())
    .filter(s => s.length > 10);

  // Enhanced task indicator patterns for meeting transcripts
  const taskIndicators = [
    /\b([A-Za-z]+)\s+(you\s+)?(take|handle|do|work\s+on|complete|finish|develop|create|build|design)/i,
    /\b([A-Za-z]+)\s+(will|should|needs?\s+to|is\s+responsible\s+for|takes?\s+care\s+of)/i,
    /\b([A-Za-z]+)\s+please\s+(work\s+on|handle|take\s+care\s+of|complete)/i,
    /\bassign\s+([^.!?]*)\s+to\s+([A-Za-z]+)/i,
    /\b([A-Za-z]+)\s+(by\s+\w+)/i, // Name followed by deadline
  ];

  sentences.forEach((sentence, index) => {
    // Check if sentence contains task indicators or assignments
    const hasTaskIndicator = taskIndicators.some(pattern => pattern.test(sentence));
    const hasAssignment = /\b([A-Za-z]+)\s+(you\s+)?(take|handle|do|work|complete|finish|by)/i.test(sentence);
    
    if (hasTaskIndicator || hasAssignment || sentence.toLowerCase().includes('by ')) {
      try {
        // Extract the actual task content more intelligently
        let taskContent = sentence;
        
        // Try to identify the main action/task
        const actionPatterns = [
          /(?:you\s+)?(take|handle|work\s+on|complete|finish|develop|create|build|design)\s+([^.!?]*?)(?:\s+by|\s+for|\s*$)/i,
          /(?:will|should|needs?\s+to)\s+(take|handle|work\s+on|complete|finish|develop|create|build|design)\s+([^.!?]*?)(?:\s+by|\s+for|\s*$)/i,
          /is\s+responsible\s+for\s+([^.!?]*?)(?:\s+by|\s+for|\s*$)/i,
          /takes?\s+care\s+of\s+([^.!?]*?)(?:\s+by|\s+for|\s*$)/i,
        ];
        
        for (const pattern of actionPatterns) {
          const match = sentence.match(pattern);
          if (match) {
            const action = match[1] || '';
            const object = match[2] || match[1] || '';
            taskContent = (action + ' ' + object).trim();
            break;
          }
        }
        
        const parsedTask = parseNaturalLanguageTask(sentence, 'transcript');
        
        // Improve task name if it's too generic
        if (parsedTask.name.length < 5 || parsedTask.name === 'New Task') {
          // Try to extract a more meaningful task name from the sentence
          const meaningfulParts = sentence
            .replace(/\b([A-Za-z]+)\s+(you\s+)?(take|handle|do|work\s+on)/i, '')
            .replace(/\bby\s+\w+/i, '')
            .replace(/\b(will|should|needs?\s+to|is\s+responsible\s+for)/i, '')
            .trim();
          
          if (meaningfulParts.length > 5) {
            parsedTask.name = meaningfulParts.charAt(0).toUpperCase() + meaningfulParts.slice(1);
          }
        }
        
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
