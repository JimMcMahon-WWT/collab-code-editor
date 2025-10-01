import { useState } from 'react';
import type { CodeIssue, ReviewResponse } from '../types/codeReview';

export function useCodeReview() {
  const [issues, setIssues] = useState<CodeIssue[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeCode = async (code: string, language: string) => {
    if (!code.trim()) {
      setError('No code to analyze');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:3001/api/review/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code, language }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze code');
      }

      const data: ReviewResponse = await response.json();
      setIssues(data.issues);
    } catch (err: any) {
      console.error('Code review error:', err);
      setError(err.message || 'Failed to analyze code');
      setIssues([]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const dismissIssue = (issue: CodeIssue) => {
    setIssues(issues.filter(i => i !== issue));
  };

  const clearIssues = () => {
    setIssues([]);
    setError(null);
  };

  return {
    issues,
    isAnalyzing,
    error,
    analyzeCode,
    dismissIssue,
    clearIssues,
  };
}
