import { useState, useCallback, useRef } from 'react';

export interface RuntimeError {
  message: string;
  stack?: string;
  line?: number;
  column?: number;
  fileName?: string;
  timestamp: string;
}

export interface FixSuggestion {
  description: string;
  code?: string;
  line?: number;
  priority: 'critical' | 'high' | 'medium' | 'low';
}

export interface DebugAnalysis {
  errorType: string;
  rootCause: string;
  explanation: string;
  fixSuggestions: FixSuggestion[];
  relatedCode?: string;
  confidence: 'high' | 'medium' | 'low';
}

export interface DebuggedError {
  id: string;
  error: RuntimeError;
  analysis?: DebugAnalysis;
  isAnalyzing: boolean;
  dismissed: boolean;
}

const API_BASE_URL = 'http://localhost:3001';
const MAX_ERROR_HISTORY = 10;
const DEDUPE_WINDOW_MS = 5000; // Ignore duplicate errors within 5 seconds

export function useDebugger() {
  const [errors, setErrors] = useState<DebuggedError[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const errorHistoryRef = useRef<RuntimeError[]>([]);
  const lastErrorRef = useRef<{ message: string; timestamp: number } | null>(null);

  const captureError = useCallback((error: RuntimeError) => {
    // Deduplicate errors - ignore if same error within 2 seconds
    const now = Date.now();
    if (lastErrorRef.current) {
      const timeSinceLastError = now - lastErrorRef.current.timestamp;
      const isSameError = lastErrorRef.current.message === error.message;
      
      if (isSameError && timeSinceLastError < DEDUPE_WINDOW_MS) {
        // Skip duplicate error
        return lastErrorRef.current.message; // Return existing ID
      }
    }

    // Update last error tracker
    lastErrorRef.current = {
      message: error.message,
      timestamp: now,
    };

    const errorId = `${Date.now()}-${Math.random()}`;
    
    const debuggedError: DebuggedError = {
      id: errorId,
      error: {
        ...error,
        timestamp: error.timestamp || new Date().toISOString(),
      },
      isAnalyzing: false,
      dismissed: false,
    };

    setErrors(prev => [debuggedError, ...prev].slice(0, 20)); // Keep last 20 errors
    
    // Add to history for pattern learning
    errorHistoryRef.current = [
      error,
      ...errorHistoryRef.current
    ].slice(0, MAX_ERROR_HISTORY);

    return errorId;
  }, []);

  const analyzeError = useCallback(async (
    errorId: string,
    code: string,
    language: string = 'javascript'
  ) => {
    setIsAnalyzing(true);
    
    // Mark error as analyzing
    setErrors(prev => prev.map(e => 
      e.id === errorId ? { ...e, isAnalyzing: true } : e
    ));

    try {
      const error = errors.find(e => e.id === errorId);
      if (!error) {
        throw new Error('Error not found');
      }

      const response = await fetch(`${API_BASE_URL}/api/debug/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: error.error,
          code,
          language,
          errorHistory: errorHistoryRef.current.slice(0, 5), // Send last 5 errors for context
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to analyze error');
      }

      const data = await response.json();
      
      // Update error with analysis
      setErrors(prev => prev.map(e => 
        e.id === errorId 
          ? { ...e, analysis: data.analysis, isAnalyzing: false } 
          : e
      ));

    } catch (err) {
      console.error('Error analysis failed:', err);
      
      // Mark error as failed
      setErrors(prev => prev.map(e => 
        e.id === errorId ? { ...e, isAnalyzing: false } : e
      ));
      
      throw err;
    } finally {
      setIsAnalyzing(false);
    }
  }, [errors]);

  const dismissError = useCallback((errorId: string) => {
    setErrors(prev => prev.map(e => 
      e.id === errorId ? { ...e, dismissed: true } : e
    ));
  }, []);

  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  const getActiveErrors = useCallback(() => {
    return errors.filter(e => !e.dismissed);
  }, [errors]);

  const getErrorHistory = useCallback(() => {
    return errorHistoryRef.current;
  }, []);

  return {
    errors,
    activeErrors: getActiveErrors(),
    isAnalyzing,
    captureError,
    analyzeError,
    dismissError,
    clearErrors,
    getErrorHistory,
  };
}
