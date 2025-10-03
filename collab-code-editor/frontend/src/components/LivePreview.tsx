import { useEffect, useRef } from 'react';
import DOMPurify from 'dompurify';
import type { RuntimeError } from '../hooks/useDebugger';

interface LivePreviewProps {
  html: string;
  css: string;
  js: string;
  onError?: (error: RuntimeError) => void;
}

export default function LivePreview({ html, css, js, onError }: LivePreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

  // SECURITY FIX #4: Listen for error messages from sandboxed iframe
  const handleMessage = (event: MessageEvent) => {
    // Security: Verify message is from our iframe
    if (event.source !== iframe.contentWindow) return;
    
    // Check if this is an error message
    if (event.data && event.data.type === 'runtime-error') {
      const runtimeError: RuntimeError = {
        message: event.data.message || 'Unknown error',
        stack: event.data.stack,
        line: event.data.line,
        column: event.data.column,
        fileName: event.data.fileName,
        timestamp: new Date().toISOString(),
      };
      
      if (onError) {
        onError(runtimeError);
      }
    }
  };

  window.addEventListener('message', handleMessage);


    // SECURITY FIX #1: Sanitize HTML and CSS to prevent XSS attacks
    // Track sanitization events for security monitoring
    const sanitizationEvents: string[] = [];
    
    // Add hooks to detect removed elements
    DOMPurify.addHook('uponSanitizeElement', (_node, data) => {
      if (data.tagName === 'script') {
        sanitizationEvents.push(`🚨 BLOCKED: <script> tag detected and removed`);
      } else if (!data.allowedTags[data.tagName]) {
        if (data.tagName !== 'body' && data.tagName !== '#text' && data.tagName !== '#comment') {
          sanitizationEvents.push(`⚠️  BLOCKED: <${data.tagName}> tag removed (not in whitelist)`);
        }
      }
    });

    DOMPurify.addHook('uponSanitizeAttribute', (node, data) => {
      if (data.attrName && data.attrName.startsWith('on')) {
        sanitizationEvents.push(`🚨 BLOCKED: ${data.attrName} event handler removed from <${node.nodeName.toLowerCase()}>`);
      }
    });

    // Sanitize CSS - remove any potential script injections
    const sanitizedCss = DOMPurify.sanitize(css, { 
      ALLOWED_TAGS: [], // No HTML tags allowed in CSS
      ALLOWED_ATTR: [],
      KEEP_CONTENT: true // Keep the CSS content
    });

    // Sanitize HTML - allow safe HTML tags but block scripts
    const sanitizedHtml = DOMPurify.sanitize(html, {
      ALLOWED_TAGS: [
        'div', 'p', 'span', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'a', 'img', 'ul', 'ol', 'li', 'br', 'hr', 'strong', 'em',
        'b', 'i', 'u', 'code', 'pre', 'blockquote', 'table', 'thead',
        'tbody', 'tr', 'td', 'th', 'section', 'article', 'header',
        'footer', 'nav', 'main', 'aside', 'figure', 'figcaption'
      ],
      ALLOWED_ATTR: [
        'class', 'id', 'href', 'src', 'alt', 'title', 'width', 'height',
        'style', 'target', 'rel', 'data-*'
      ],
      ALLOW_DATA_ATTR: true
    });

    // Remove hooks to prevent memory leaks
    DOMPurify.removeAllHooks();

    // Log any sanitization events
    if (sanitizationEvents.length > 0) {
      console.group('🛡️ DOMPurify Security: Malicious content sanitized');
      sanitizationEvents.forEach(event => console.warn(event));
      console.groupEnd();
    }

    // Count lines in HTML and CSS content (after sanitization)
    const htmlLines = sanitizedHtml.split('\n').length;
    const cssLines = sanitizedCss.split('\n').length;
    
    // Line calculation: 
    // 1: <!DOCTYPE html>
    // 2: <html><head><style> (all on one line)
    // 3 to 2+cssLines: CSS content
    // 3+cssLines: </style></head><body> (one line)
    // 4+cssLines to 3+cssLines+htmlLines: HTML content
    // 4+cssLines+htmlLines: <script>window.__lineOffset=X;window.addEventListener... (one line)
    // 5+cssLines+htmlLines: USER JS STARTS HERE
    
    const jsStartLine = 5 + cssLines + htmlLines;
    
    // Note: JavaScript is NOT sanitized as users need to write arbitrary code
    // The iframe sandbox provides isolation instead
    const content = `<!DOCTYPE html>
<html><head><style>
${sanitizedCss}
</style></head><body>
${sanitizedHtml}
<script>window.addEventListener('error',function(e){var line=e.lineno-${jsStartLine};if(line>0){window.parent.postMessage({type:'runtime-error',message:e.message,stack:e.error?.stack,line:line,column:e.colno,fileName:e.filename},'*');var d=document.createElement('div');d.style.cssText='color:#dc2626;padding:12px;background:#fee2e2;border-left:4px solid #dc2626;margin:10px;font-family:monospace;font-size:14px;';d.innerHTML='<strong>Error (Line '+line+'):</strong> '+e.message;document.body.appendChild(d)}});
${js}
</script></body></html>`;

iframe.srcdoc = content;

    // Cleanup message listener
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [html, css, js, onError]);
  
  return (
    <iframe
      ref={iframeRef}
      title="Live Preview"
      sandbox="allow-scripts"
      style={{
        width: '100%',
        height: '100%',
        border: 'none',
        backgroundColor: 'white',
      }}
    />
  );
}