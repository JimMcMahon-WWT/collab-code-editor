import { useState, useEffect, useRef } from 'react';
import { Send } from 'lucide-react';

interface Message {
  id: string;
  user: string;
  text: string;
  timestamp: Date;
}

interface ChatProps {
  messages: Message[];
  onSendMessage: (text: string) => void;
  currentUser: string;
}

export default function Chat({ messages, onSendMessage, currentUser }: ChatProps) {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSendMessage(inputValue);
      setInputValue('');
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%',
      backgroundColor: '#1e1e1e',
      color: '#d4d4d4'
    }}>
      <div style={{ 
        padding: '10px', 
        borderBottom: '1px solid #333',
        fontWeight: 'bold'
      }}>
        Team Chat
      </div>
      
      <div style={{ 
        flex: 1, 
        overflowY: 'auto', 
        padding: '10px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        {messages.map((msg) => (
          <div key={msg.id} style={{
            padding: '8px',
            backgroundColor: msg.user === currentUser ? '#0e639c' : '#2d2d2d',
            borderRadius: '4px',
            maxWidth: '80%',
            alignSelf: msg.user === currentUser ? 'flex-end' : 'flex-start'
          }}>
            <div style={{ fontSize: '12px', opacity: 0.7 }}>{msg.user}</div>
            <div>{msg.text}</div>
            <div style={{ fontSize: '10px', opacity: 0.5, marginTop: '4px' }}>
              {msg.timestamp.toLocaleTimeString()}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} style={{ 
        padding: '10px', 
        borderTop: '1px solid #333',
        display: 'flex',
        gap: '8px'
      }}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Type a message..."
          style={{
            flex: 1,
            padding: '8px',
            backgroundColor: '#2d2d2d',
            border: '1px solid #3e3e3e',
            borderRadius: '4px',
            color: '#d4d4d4',
            outline: 'none'
          }}
        />
        <button type="submit" style={{
          padding: '8px 12px',
          backgroundColor: '#0e639c',
          border: 'none',
          borderRadius: '4px',
          color: 'white',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}