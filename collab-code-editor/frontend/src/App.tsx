import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import CodeEditor from './components/CodeEditor';
import LivePreview from './components/LivePreview';
import Chat from './components/Chat';
import { Code, Eye, MessageSquare } from 'lucide-react';

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

  // Code states
  const [html, setHtml] = useState('<h1>Hello World!</h1>\n<p>Start editing to see changes</p>');
  const [css, setCss] = useState('body {\n  font-family: Arial, sans-serif;\n  padding: 20px;\n}\n\nh1 {\n  color: #333;\n}');
  const [js, setJs] = useState('console.log("Ready to code!");');
  
  // UI states
  const [activeLanguage, setActiveLanguage] = useState<'html' | 'css' | 'javascript'>('html');
  const [showChat, setShowChat] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);

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

  const getCurrentCode = () => {
    switch (activeLanguage) {
      case 'html': return html;
      case 'css': return css;
      case 'javascript': return js;
    }
  };

  const handleCodeChange = (value: string) => {
    switch (activeLanguage) {
      case 'html': setHtml(value); break;
      case 'css': setCss(value); break;
      case 'javascript': setJs(value); break;
    }
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
            backgroundColor: connected ? '#4caf50' : '#f44336'
          }} />
          <span style={{ color: '#d4d4d4', fontSize: '12px' }}>
            {connected ? 'Connected' : 'Disconnected'}
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
            <CodeEditor
              language={activeLanguage}
              value={getCurrentCode()}
              onChange={handleCodeChange}
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
              {showChat ? 'Hide Chat' : 'Show Chat'}
            </button>
          </div>
          <div style={{ flex: 1 }}>
            <LivePreview html={html} css={css} js={js} />
          </div>
        </div>

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