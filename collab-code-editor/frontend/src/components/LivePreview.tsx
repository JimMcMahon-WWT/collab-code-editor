import { useEffect, useRef } from 'react';
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

    const document = iframe.contentDocument;
    if (!document) return;

    // Create a unique callback name to communicate with iframe
    const callbackName = `errorCallback_${Date.now()}`;
    
    // Expose error handler to iframe via window
    (window as any)[callbackName] = (error: any) => {
      const runtimeError: RuntimeError = {
        message: error.message || 'Unknown error',
        stack: error.stack,
        line: error.line,
        column: error.column,
        fileName: error.fileName,
        timestamp: new Date().toISOString(),
      };
      
      if (onError) {
        onError(runtimeError);
      }
    };

    // Count lines in HTML and CSS content
    const htmlLines = html.split('\n').length;
    const cssLines = css.split('\n').length;
    
    // Line calculation: 
    // 1: <!DOCTYPE html>
    // 2: <html><head><style> (all on one line)
    // 3 to 2+cssLines: CSS content
    // 3+cssLines: </style></head><body> (one line)
    // 4+cssLines to 3+cssLines+htmlLines: HTML content
    // 4+cssLines+htmlLines: <script>window.__lineOffset=X;window.addEventListener... (one line)
    // 5+cssLines+htmlLines: USER JS STARTS HERE
    
    const jsStartLine = 5 + cssLines + htmlLines;
    
    const content = `<!DOCTYPE html>
<html><head><style>
${css}
</style></head><body>
${html}
<script>window.addEventListener('error',function(e){var line=e.lineno-${jsStartLine};if(line>0&&window.parent&&window.parent.${callbackName}){window.parent.${callbackName}({message:e.message,stack:e.error?.stack,line:line,column:e.colno,fileName:e.filename});var d=document.createElement('div');d.style.cssText='color:#dc2626;padding:12px;background:#fee2e2;border-left:4px solid #dc2626;margin:10px;font-family:monospace;font-size:14px;';d.innerHTML='<strong>Error (Line '+line+'):</strong> '+e.message;document.body.appendChild(d)}});
${js}
</script></body></html>`;

    document.open();
    document.write(content);
    document.close();

    // Cleanup
    return () => {
      delete (window as any)[callbackName];
    };
  }, [html, css, js, onError]);

  return (
    <iframe
      ref={iframeRef}
      title="Live Preview"
      sandbox="allow-scripts allow-same-origin"
      style={{
        width: '100%',
        height: '100%',
        border: 'none',
        backgroundColor: 'white',
      }}
    />
  );
}