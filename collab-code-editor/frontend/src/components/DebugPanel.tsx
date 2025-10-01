import { Bug, X, AlertCircle, CheckCircle, Clock, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import type { DebuggedError, FixSuggestion } from '../hooks/useDebugger';

interface DebugPanelProps {
  errors: DebuggedError[];
  onAnalyze: (errorId: string) => void;
  onDismiss: (errorId: string) => void;
  onClear: () => void;
  onApplyFix?: (errorId: string, suggestion: FixSuggestion) => void;
}

export default function DebugPanel({
  errors,
  onAnalyze,
  onDismiss,
  onClear,
  onApplyFix
}: DebugPanelProps) {
  const [expandedErrors, setExpandedErrors] = useState<Set<string>>(new Set());

  const toggleExpand = (errorId: string) => {
    setExpandedErrors(prev => {
      const next = new Set(prev);
      if (next.has(errorId)) {
        next.delete(errorId);
      } else {
        next.add(errorId);
      }
      return next;
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  const activeErrors = errors.filter(e => !e.dismissed);

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="flex items-center justify-between p-3 bg-white border-b">
        <div className="flex items-center gap-2">
          <Bug className="w-5 h-5 text-red-500" />
          <h3 className="font-semibold text-gray-900">AI Debugger</h3>
          {activeErrors.length > 0 && (
            <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 rounded-full">
              {activeErrors.length}
            </span>
          )}
        </div>
        {activeErrors.length > 0 && (
          <button
            onClick={onClear}
            className="text-sm text-gray-600 hover:text-gray-900 px-2 py-1 rounded hover:bg-gray-100"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Error List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {activeErrors.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <CheckCircle className="w-12 h-12 mb-3 text-green-500" />
            <p className="text-sm font-medium">No errors detected</p>
            <p className="text-xs text-gray-400 mt-1">Write some JavaScript to test debugging</p>
          </div>
        ) : (
          activeErrors.map((debuggedError) => (
            <div
              key={debuggedError.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
            >
              {/* Error Header */}
              <div className="p-3">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-start gap-2 flex-1 min-w-0">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 break-words">
                        {debuggedError.error.message}
                      </p>
                      {debuggedError.error.line && (
                        <p className="text-xs text-gray-500 mt-1">
                          Line {debuggedError.error.line}
                          {debuggedError.error.column && `:${debuggedError.error.column}`}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => onDismiss(debuggedError.id)}
                    className="p-1 hover:bg-gray-100 rounded flex-shrink-0"
                  >
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 mt-3">
                  {!debuggedError.analysis && !debuggedError.isAnalyzing && (
                    <button
                      onClick={() => onAnalyze(debuggedError.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-md font-medium transition-colors"
                    >
                      <Sparkles className="w-4 h-4" />
                      Analyze with AI
                    </button>
                  )}
                  
                  {debuggedError.isAnalyzing && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4 animate-spin" />
                      <span>Analyzing...</span>
                    </div>
                  )}

                  {debuggedError.analysis && (
                    <button
                      onClick={() => toggleExpand(debuggedError.id)}
                      className="flex items-center gap-1 text-sm text-purple-600 hover:text-purple-700 font-medium"
                    >
                      {expandedErrors.has(debuggedError.id) ? (
                        <>
                          <ChevronUp className="w-4 h-4" />
                          Hide Analysis
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-4 h-4" />
                          Show Analysis
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* AI Analysis (Expanded) */}
              {debuggedError.analysis && expandedErrors.has(debuggedError.id) && (
                <div className="border-t border-gray-200 bg-gray-50 p-3 space-y-3">
                  {/* Error Type & Confidence */}
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded">
                      {debuggedError.analysis.errorType}
                    </span>
                    <span className={`text-xs font-medium ${getConfidenceColor(debuggedError.analysis.confidence)}`}>
                      {debuggedError.analysis.confidence} confidence
                    </span>
                  </div>

                  {/* Root Cause */}
                  <div>
                    <h4 className="text-xs font-semibold text-gray-700 mb-1">Root Cause</h4>
                    <p className="text-sm text-gray-900">{debuggedError.analysis.rootCause}</p>
                  </div>

                  {/* Explanation */}
                  <div>
                    <h4 className="text-xs font-semibold text-gray-700 mb-1">Explanation</h4>
                    <p className="text-sm text-gray-600">{debuggedError.analysis.explanation}</p>
                  </div>

                  {/* Fix Suggestions */}
                  {debuggedError.analysis.fixSuggestions.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-gray-700 mb-2">Fix Suggestions</h4>
                      <div className="space-y-2">
                        {debuggedError.analysis.fixSuggestions.map((suggestion, idx) => (
                          <div
                            key={idx}
                            className={`p-2 rounded border ${getPriorityColor(suggestion.priority)}`}
                          >
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <p className="text-sm font-medium flex-1">{suggestion.description}</p>
                              <span className="text-xs px-1.5 py-0.5 bg-white rounded">
                                {suggestion.priority}
                              </span>
                            </div>
                            
                            {suggestion.code && (
                              <div className="mt-2">
                                <pre className="bg-white p-2 rounded text-xs overflow-x-auto border">
                                  <code>{suggestion.code}</code>
                                </pre>
                                {onApplyFix && (
                                  <button
                                    onClick={() => onApplyFix(debuggedError.id, suggestion)}
                                    className="mt-2 text-xs px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded"
                                  >
                                    Apply Fix
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Related Code */}
                  {debuggedError.analysis.relatedCode && (
                    <div>
                      <h4 className="text-xs font-semibold text-gray-700 mb-1">Related Code</h4>
                      <pre className="bg-white p-2 rounded text-xs overflow-x-auto border border-gray-200">
                        <code>{debuggedError.analysis.relatedCode}</code>
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
