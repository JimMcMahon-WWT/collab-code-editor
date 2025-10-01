import { useState } from 'react';
import { AlertCircle, AlertTriangle, Info, CheckCircle, XCircle, Sparkles } from 'lucide-react';
import type { CodeIssue } from '../types/codeReview';

interface ReviewSidebarProps {
  issues: CodeIssue[];
  isAnalyzing: boolean;
  onAnalyze: () => void;
  onIssueClick: (issue: CodeIssue) => void;
  onAcceptSuggestion: (issue: CodeIssue) => void;
  onDismissIssue: (issue: CodeIssue) => void;
}

export default function ReviewSidebar({
  issues,
  isAnalyzing,
  onAnalyze,
  onIssueClick,
  onAcceptSuggestion,
  onDismissIssue,
}: ReviewSidebarProps) {
  const [expandedIssue, setExpandedIssue] = useState<number | null>(null);

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'error':
        return <AlertCircle size={16} color="#f44336" />;
      case 'warning':
        return <AlertTriangle size={16} color="#ff9800" />;
      case 'info':
        return <Info size={16} color="#2196f3" />;
      default:
        return <Info size={16} color="#888" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'syntax':
        return '#f44336';
      case 'quality':
        return '#ff9800';
      case 'performance':
        return '#2196f3';
      case 'security':
        return '#9c27b0';
      default:
        return '#888';
    }
  };

  return (
    <div style={{
      width: '350px',
      height: '100%',
      backgroundColor: '#1e1e1e',
      borderLeft: '1px solid #333',
      display: 'flex',
      flexDirection: 'column',
      color: '#d4d4d4'
    }}>
      {/* Header */}
      <div style={{
        padding: '15px',
        borderBottom: '1px solid #333',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={20} color="#0e639c" />
          <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 'bold' }}>AI Code Review</h3>
        </div>
        <button
          onClick={onAnalyze}
          disabled={isAnalyzing}
          style={{
            padding: '6px 12px',
            backgroundColor: isAnalyzing ? '#555' : '#0e639c',
            border: 'none',
            borderRadius: '4px',
            color: 'white',
            fontSize: '12px',
            cursor: isAnalyzing ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          {isAnalyzing ? 'Analyzing...' : 'Analyze Code'}
        </button>
      </div>

      {/* Issues List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
        {isAnalyzing && (
          <div style={{ textAlign: 'center', padding: '20px', color: '#888' }}>
            <Sparkles size={24} style={{ animation: 'spin 2s linear infinite' }} />
            <p style={{ marginTop: '10px', fontSize: '14px' }}>Analyzing your code...</p>
          </div>
        )}

        {!isAnalyzing && issues.length === 0 && (
          <div style={{ textAlign: 'center', padding: '20px', color: '#888' }}>
            <CheckCircle size={32} color="#4caf50" />
            <p style={{ marginTop: '10px', fontSize: '14px' }}>No issues found!</p>
            <p style={{ fontSize: '12px', marginTop: '5px' }}>Click "Analyze Code" to review.</p>
          </div>
        )}

        {!isAnalyzing && issues.map((issue, index) => (
          <div
            key={index}
            style={{
              backgroundColor: '#2d2d2d',
              borderRadius: '6px',
              padding: '12px',
              marginBottom: '10px',
              cursor: 'pointer',
              border: '1px solid #3e3e3e',
              transition: 'all 0.2s'
            }}
            onClick={() => {
              setExpandedIssue(expandedIssue === index ? null : index);
              onIssueClick(issue);
            }}
          >
            {/* Issue Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              {getSeverityIcon(issue.severity)}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  <span style={{
                    fontSize: '10px',
                    padding: '2px 6px',
                    borderRadius: '3px',
                    backgroundColor: getCategoryColor(issue.category),
                    color: 'white',
                    fontWeight: 'bold',
                    textTransform: 'uppercase'
                  }}>
                    {issue.category}
                  </span>
                  <span style={{ fontSize: '11px', color: '#888' }}>Line {issue.line}</span>
                </div>
                <p style={{ margin: 0, fontSize: '13px', lineHeight: '1.4' }}>{issue.message}</p>
              </div>
            </div>

            {/* Expanded Details */}
            {expandedIssue === index && issue.suggestion && (
              <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #3e3e3e' }}>
                <p style={{ fontSize: '12px', color: '#888', marginBottom: '8px', fontWeight: 'bold' }}>
                  💡 Suggestion:
                </p>
                <p style={{ fontSize: '12px', lineHeight: '1.5', margin: '0 0 12px 0' }}>
                  {issue.suggestion}
                </p>
                
                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAcceptSuggestion(issue);
                    }}
                    style={{
                      flex: 1,
                      padding: '6px',
                      backgroundColor: '#4caf50',
                      border: 'none',
                      borderRadius: '4px',
                      color: 'white',
                      fontSize: '11px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px'
                    }}
                  >
                    <CheckCircle size={12} />
                    Apply Fix
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDismissIssue(issue);
                    }}
                    style={{
                      flex: 1,
                      padding: '6px',
                      backgroundColor: '#555',
                      border: 'none',
                      borderRadius: '4px',
                      color: 'white',
                      fontSize: '11px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px'
                    }}
                  >
                    <XCircle size={12} />
                    Dismiss
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Summary Footer */}
      {!isAnalyzing && issues.length > 0 && (
        <div style={{
          padding: '12px 15px',
          borderTop: '1px solid #333',
          fontSize: '12px',
          color: '#888',
          display: 'flex',
          justifyContent: 'space-between'
        }}>
          <span>
            {issues.filter(i => i.severity === 'error').length} errors, {' '}
            {issues.filter(i => i.severity === 'warning').length} warnings
          </span>
          <span>{issues.length} total</span>
        </div>
      )}
    </div>
  );
}
