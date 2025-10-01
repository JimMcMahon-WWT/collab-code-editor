import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import CollaborativeEditor from './components/CollaborativeEditor';
import LivePreview from './components/LivePreview';
import Chat from './components/Chat';
import ReviewSidebar from './components/ReviewSidebar';
import DebugPanel from './components/DebugPanel';
import { useCollaboration } from './hooks/useCollaboration';
import { useCodeReview } from './hooks/useCodeReview';
import { useDebugger } from './hooks/useDebugger';
import type { CodeIssue } from './types/codeReview';
import type { FixSuggestion } from './hooks/useDebugger';
import { Code, Eye, MessageSquare, Sparkles, Bug } from 'lucide-react';

interface Message {
  id: string;
  user: string;
  text: string;
  timestamp: Date;
}

function App() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [currentUser] = useState(`User${Math.floor(Math.random() * 1000)}`);
  const [connected, setConnected] = useState(false);

  // Yjs collaboration
  const { ydoc, provider, synced } = useCollaboration('code-room');
  
  // Code states - we'll read from Yjs
  const [html, setHtml] = useState('');
  const [css, setCss] = useState('');
  const [js, setJs] = useState('');
  
  // UI states
  const [activeLanguage, setActiveLanguage] = useState<'html' | 'css' | 'javascript'>('html');
  const [showChat, setShowChat] = useState(true);
  const [showReview, setShowReview] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  
  // Code review
  const { issues, isAnalyzing, analyzeCode, dismissIssue } = useCodeReview();
  
  // Debugger
  const { 
    activeErrors, 
    captureError, 
    analyzeError, 
    dismissError, 
    clearErrors 
  } = useDebugger();

  // Socket.io connection
  useEffect(() => {
    const newSocket = io('http://localhost:3001');
    
    newSocket.on('connect', () => {
      console.log('Connected to server');
      setConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
      setConnected(false);
    });

    newSocket.on('chat-message', (message: Message) => {
      setMessages(prev => [...prev, { ...message, timestamp: new Date(message.timestamp) }]);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  // Update preview when Yjs document changes
  useEffect(() => {
    const htmlText = ydoc.getText('html');
    const cssText = ydoc.getText('css');
    const jsText = ydoc.getText('javascript');

    const updateHtml = () => setHtml(htmlText.toString());
    const updateCss = () => setCss(cssText.toString());
    const updateJs = () => setJs(jsText.toString());

    htmlText.observe(updateHtml);
    cssText.observe(updateCss);
    jsText.observe(updateJs);

    // Set initial values
    setHtml(htmlText.toString());
    setCss(cssText.toString());
    setJs(jsText.toString());

    // Initialize with default content if empty
    if (htmlText.toString() === '' && synced) {
      htmlText.insert(0, '<h1>Hello World!</h1>\n<p>Start editing to see changes</p>');
    }
    if (cssText.toString() === '' && synced) {
      cssText.insert(0, 'body {\n  font-family: Arial, sans-serif;\n  padding: 20px;\n}\n\nh1 {\n  color: #333;\n}');
    }
    if (jsText.toString() === '' && synced) {
      jsText.insert(0, 'console.log("Ready to code!");');
    }

    return () => {
      htmlText.unobserve(updateHtml);
      cssText.unobserve(updateCss);
      jsText.unobserve(updateJs);
    };
  }, [ydoc, synced]);

  const handleSendMessage = (text: string) => {
    if (!socket) return;
    
    const message: Message = {
      id: Date.now().toString(),
      user: currentUser,
      text,
      timestamp: new Date()
    };
    
    socket.emit('chat-message', message);
    setMessages(prev => [...prev, message]);
  };

  // Code review handlers
  const handleAnalyzeCode = () => {
    const currentCode = getCurrentCode();
    analyzeCode(currentCode, activeLanguage);
  };

  const handleIssueClick = (issue: CodeIssue) => {
    // Will jump to line in editor
    console.log('Jump to line:', issue.line);
  };

  const handleAcceptSuggestion = (issue: CodeIssue) => {
    console.log('Accept suggestion for:', issue);
    // TODO: Apply the fix to the code
    dismissIssue(issue);
  };

  const getCurrentCode = () => {
    switch (activeLanguage) {
      case 'html': return html;
      case 'css': return css;
      case 'javascript': return js;
    }
  };

  // Debug handlers
  const handleRuntimeError = (error: any) => {
    const errorId = captureError(error);
    
    // Only auto-open and analyze if it's a new error (not a duplicate)
    if (errorId && errorId.includes('-')) {
      setShowDebug(true); // Auto-open debug panel on error
      
      // Auto-analyze the error after a short delay
      setTimeout(() => {
        analyzeError(errorId, js, 'javascript');
      }, 500);
    }
  };

  const handleApplyFix = (errorId: string, suggestion: FixSuggestion) => {
    if (!suggestion.code || !suggestion.line) {
      console.log('Cannot apply fix: missing code or line number');
      return;
    }
    
    // TODO: Implement applying fix to the editor at specific line
    console.log('Apply fix:', suggestion);
    
    // For now, just dismiss the error
    dismissError(errorId);
  };

  return (
    <div style={{ display: 'flex', height: '100vh', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{
        height: '50px',
        backgroundColor: '#1e1e1e',
        borderBottom: '1px solid #333',
        display: 'flex',
        alignItems: 'center',
        padding: '0 20px',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Code color="#0e639c" size={24} />
          <h1 style={{ color: '#d4d4d4', fontSize: '18px', margin: 0 }}>
            Collaborative Code Editor
          </h1>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: connected && synced ? '#4caf50' : '#f44336'
          }} />
          <span style={{ color: '#d4d4d4', fontSize: '12px' }}>
            {connected && synced ? 'Synced' : 'Connecting...'}
          </span>
          <span style={{ color: '#888', fontSize: '12px' }}>
            {currentUser}
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left Panel - Editor */}
        <div style={{ flex: showChat ? 2 : 3, display: 'flex', flexDirection: 'column' }}>
          {/* Language Tabs */}
          <div style={{
            display: 'flex',
            backgroundColor: '#2d2d2d',
            borderBottom: '1px solid #333'
          }}>
            {(['html', 'css', 'javascript'] as const).map(lang => (
              <button
                key={lang}
                onClick={() => setActiveLanguage(lang)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: activeLanguage === lang ? '#1e1e1e' : 'transparent',
                  border: 'none',
                  borderBottom: activeLanguage === lang ? '2px solid #0e639c' : 'none',
                  color: '#d4d4d4',
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  fontSize: '12px',
                  fontWeight: activeLanguage === lang ? 'bold' : 'normal'
                }}
              >
                {lang}
              </button>
            ))}
          </div>

          {/* Editor */}
          <div style={{ flex: 1 }}>
            <CollaborativeEditor
              language={activeLanguage}
              ydoc={ydoc}
              provider={provider}
              textKey={activeLanguage}
            />
          </div>
        </div>

        {/* Right Panel - Preview */}
        <div style={{
          flex: showChat ? 2 : 3,
          borderLeft: '1px solid #333',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{
            height: '40px',
            backgroundColor: '#2d2d2d',
            borderBottom: '1px solid #333',
            display: 'flex',
            alignItems: 'center',
            padding: '0 15px',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Eye size={16} color="#d4d4d4" />
              <span style={{ color: '#d4d4d4', fontSize: '12px', fontWeight: 'bold' }}>
                LIVE PREVIEW
              </span>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setShowDebug(!showDebug)}
                style={{
                  backgroundColor: showDebug ? '#dc2626' : '#3e3e3e',
                  border: 'none',
                  padding: '5px 10px',
                  borderRadius: '4px',
                  color: '#d4d4d4',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  fontSize: '11px',
                  position: 'relative'
                }}
              >
                <Bug size={14} />
                Debug
                {activeErrors.length > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
                    backgroundColor: '#ef4444',
                    color: 'white',
                    borderRadius: '10px',
                    padding: '2px 6px',
                    fontSize: '10px',
                    fontWeight: 'bold'
                  }}>
                    {activeErrors.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setShowReview(!showReview)}
                style={{
                  backgroundColor: showReview ? '#9c27b0' : '#3e3e3e',
                  border: 'none',
                  padding: '5px 10px',
                  borderRadius: '4px',
                  color: '#d4d4d4',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  fontSize: '11px'
                }}
              >
                <Sparkles size={14} />
                AI Review
              </button>
              <button
                onClick={() => setShowChat(!showChat)}
                style={{
                  backgroundColor: showChat ? '#0e639c' : '#3e3e3e',
                  border: 'none',
                  padding: '5px 10px',
                  borderRadius: '4px',
                  color: '#d4d4d4',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  fontSize: '11px'
                }}
              >
                <MessageSquare size={14} />
                Chat
              </button>
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <LivePreview 
              html={html} 
              css={css} 
              js={js} 
              onError={handleRuntimeError}
            />
          </div>
        </div>

        {/* Debug Panel */}
        {showDebug && (
          <div style={{ width: '350px', borderLeft: '1px solid #333' }}>
            <DebugPanel
              errors={activeErrors}
              onAnalyze={(errorId) => analyzeError(errorId, js, 'javascript')}
              onDismiss={dismissError}
              onClear={clearErrors}
              onApplyFix={handleApplyFix}
            />
          </div>
        )}

        {/* AI Review Panel */}
        {showReview && (
          <ReviewSidebar
            issues={issues}
            isAnalyzing={isAnalyzing}
            onAnalyze={handleAnalyzeCode}
            onIssueClick={handleIssueClick}
            onAcceptSuggestion={handleAcceptSuggestion}
            onDismissIssue={dismissIssue}
          />
        )}

        {/* Chat Panel */}
        {showChat && (
          <div style={{ width: '300px', borderLeft: '1px solid #333' }}>
            <Chat
              messages={messages}
              onSendMessage={handleSendMessage}
              currentUser={currentUser}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;