export interface CodeIssue {
  line: number;
  column?: number;
  endLine?: number;
  severity: 'error' | 'warning' | 'info';
  message: string;
  suggestion?: string;
  category: 'syntax' | 'quality' | 'performance' | 'security';
}

export interface ReviewResponse {
  success: boolean;
  issues: CodeIssue[];
  timestamp: string;
}
