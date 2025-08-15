/**
 * Validation utilities for GT Notes data entry
 * Based on standardized formatting rules
 */

export interface ValidationResult {
  isValid: boolean;
  message?: string;
  formatted?: string;
}

/**
 * Validates and formats semester input
 * Format: "Fall 2025"
 * Allowed terms: Spring, Summer, Fall
 * Capitalization: First letter capitalized, rest lowercase
 * Year: 4 digits between 2000 and 2100
 */
export function validateSemester(input: string): ValidationResult {
  if (!input || input.trim() === '') {
    return { isValid: false, message: 'Semester is required' };
  }

  const trimmed = input.trim();
  
  // Check format: "Term YYYY"
  const semesterRegex = /^(spring|summer|fall)\s+(\d{4})$/i;
  const match = trimmed.match(semesterRegex);
  
  if (!match) {
    return { 
      isValid: false, 
      message: 'Format should be "Term YYYY" (e.g., "Fall 2025")' 
    };
  }
  
  const [, term, yearStr] = match;
  const year = parseInt(yearStr, 10);
  
  // Validate year range
  if (year < 2000 || year > 2100) {
    return { 
      isValid: false, 
      message: 'Year must be between 2000 and 2100' 
    };
  }
  
  // Format correctly: capitalize first letter, lowercase rest
  const formattedTerm = term.charAt(0).toUpperCase() + term.slice(1).toLowerCase();
  const formatted = `${formattedTerm} ${year}`;
  
  return { 
    isValid: true, 
    formatted 
  };
}

/**
 * Validates and formats course input
 * Format: "CS 1301"
 * Subject: All uppercase letters (2–4 characters)
 * Number: 3–4 digits
 * Spacing: Exactly one space between subject and number
 */
export function validateCourse(input: string): ValidationResult {
  if (!input || input.trim() === '') {
    return { isValid: false, message: 'Course is required' };
  }

  const trimmed = input.trim();
  
  // Remove extra spaces and normalize
  const normalized = trimmed.replace(/\s+/g, ' ');
  
  // Check format: "SUBJECT NUMBER"
  const courseRegex = /^([a-zA-Z]{2,4})\s+(\d{3,4})$/;
  const match = normalized.match(courseRegex);
  
  if (!match) {
    return { 
      isValid: false, 
      message: 'Format should be "SUBJECT NUMBER" (e.g., "CS 1301")' 
    };
  }
  
  const [, subject, number] = match;
  
  // Format correctly: uppercase subject
  const formatted = `${subject.toUpperCase()} ${number}`;
  
  return { 
    isValid: true, 
    formatted 
  };
}

/**
 * Validates and formats professor name input
 * Format: "First Last" or "First M. Last"
 * Capitalization: Title case for each name part
 * Allowed characters: Letters, apostrophes ('), and hyphens (-)
 * No titles: Do not include Dr., Prof., Professor, Mr, Mrs, Ms, etc.
 */
export function validateProfessorName(input: string): ValidationResult {
  if (!input || input.trim() === '') {
    return { isValid: false, message: 'Professor name is required' };
  }

  const trimmed = input.trim();
  
  // Check for titles that should not be included
  const titleRegex = /^(dr\.?|prof\.?|professor|mr\.?|mrs\.?|ms\.?)\s+/i;
  if (titleRegex.test(trimmed)) {
    return { 
      isValid: false, 
      message: 'Do not include titles (Dr., Prof., Mr., Mrs., Ms.)' 
    };
  }
  
  // Allow letters, spaces, apostrophes, hyphens, and periods (for middle initials)
  const allowedCharsRegex = /^[a-zA-Z\s'\-.]+$/;
  if (!allowedCharsRegex.test(trimmed)) {
    return { 
      isValid: false, 
      message: 'Only letters, apostrophes, hyphens, and periods are allowed' 
    };
  }
  
  // Check for reasonable name format (at least first and last name)
  // This regex allows: First Last, First Middle Last, First M. Last, etc.
  const nameRegex = /^[a-zA-Z][a-zA-Z'\-]*(\s+[a-zA-Z]([a-zA-Z'\-]*|\.))*\s+[a-zA-Z][a-zA-Z'\-]*$/;
  if (!nameRegex.test(trimmed)) {
    return { 
      isValid: false, 
      message: 'Enter first and last name (e.g., "Jane Smith" or "John Q. Smith")' 
    };
  }
  
  // Format to title case
  const formatted = trimmed
    .split(/(\s+)/)
    .map(word => {
      if (word.trim() === '') return word; // preserve spaces
      
      // Handle middle initials (single letter followed by period)
      if (/^[a-zA-Z]\.?$/.test(word)) {
        return word.toUpperCase().endsWith('.') ? word.toUpperCase() : word.toUpperCase() + '.';
      }
      
      // Title case for regular words
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join('');
  
  return { 
    isValid: true, 
    formatted 
  };
}

/**
 * Generate semester options for the current and upcoming years
 */
export function generateSemesterOptions(): Array<{ value: string; label: string }> {
  const currentYear = new Date().getFullYear();
  const terms = ['Spring', 'Summer', 'Fall'];
  const options: Array<{ value: string; label: string }> = [];
  
  // Generate options for current year and next 2 years
  for (let year = currentYear; year <= currentYear + 2; year++) {
    for (const term of terms) {
      const label = `${term} ${year}`;
      const value = `${term.toLowerCase()}-${year}`;
      options.push({ value, label });
    }
  }
  
  // Add some past semesters as well
  for (let year = currentYear - 1; year >= currentYear - 2; year--) {
    for (const term of ['Fall', 'Summer', 'Spring']) {
      const label = `${term} ${year}`;
      const value = `${term.toLowerCase()}-${year}`;
      options.unshift({ value, label });
    }
  }
  
  return options.sort((a, b) => {
    // Sort by year desc, then by term (Spring, Summer, Fall)
    const [aYear, aTerm] = [parseInt(a.label.split(' ')[1]), a.label.split(' ')[0]];
    const [bYear, bTerm] = [parseInt(b.label.split(' ')[1]), b.label.split(' ')[0]];
    
    if (aYear !== bYear) return bYear - aYear;
    
    const termOrder = { 'Fall': 0, 'Summer': 1, 'Spring': 2 };
    return termOrder[aTerm as keyof typeof termOrder] - termOrder[bTerm as keyof typeof termOrder];
  });
}

/**
 * Convert semester label to value format
 */
export function semesterLabelToValue(label: string): string {
  const parts = label.split(' ');
  if (parts.length === 2) {
    return `${parts[0].toLowerCase()}-${parts[1]}`;
  }
  return label;
}

/**
 * Convert semester value to label format
 */
export function semesterValueToLabel(value: string): string {
  const parts = value.split('-');
  if (parts.length === 2) {
    const term = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
    return `${term} ${parts[1]}`;
  }
  return value;
}
