import { useEffect, useRef } from 'react';
import { Editor } from '@monaco-editor/react';
import * as Y from 'yjs';
import { MonacoBinding } from 'y-monaco';
import { WebsocketProvider } from 'y-websocket';
import type * as Monaco from 'monaco-editor';

interface CollaborativeEditorProps {
  language: string;
  ydoc: Y.Doc;
  provider: WebsocketProvider | null;
  textKey: string; // Key for the Y.Text in the document
}

export default function CollaborativeEditor({
  language,
  ydoc,
  provider,
  textKey,
}: CollaborativeEditorProps) {
  const editorRef = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null);
  const bindingRef = useRef<MonacoBinding | null>(null);

  function handleEditorDidMount(editor: Monaco.editor.IStandaloneCodeEditor) {
    editorRef.current = editor;

    // Get or create the Y.Text for this language
    const ytext = ydoc.getText(textKey);

    // Create Monaco binding for collaborative editing
    if (provider) {
      // Suppress Monaco decoration warnings (known y-monaco issue)
      const originalConsoleError = console.error;
      console.error = (...args) => {
        if (typeof args[0] === 'string' && args[0].includes('deltaDecorations')) {
          return; // Suppress this specific warning
        }
        originalConsoleError.apply(console, args);
      };

      bindingRef.current = new MonacoBinding(
        ytext,
        editor.getModel()!,
        new Set([editor]),
        provider.awareness
      );

      console.log(`✨ Collaborative editing enabled for ${textKey}`);
    }
  }

  useEffect(() => {
    return () => {
      // Cleanup binding on unmount
      if (bindingRef.current) {
        bindingRef.current.destroy();
      }
    };
  }, []);

  // When language changes, we need to update the editor model
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    // Destroy old binding
    if (bindingRef.current) {
      bindingRef.current.destroy();
      bindingRef.current = null;
    }

    // Create new binding with the new text key
    const ytext = ydoc.getText(textKey);
    if (provider) {
      bindingRef.current = new MonacoBinding(
        ytext,
        editor.getModel()!,
        new Set([editor]),
        provider.awareness
      );
    }
  }, [textKey, ydoc, provider]);

  return (
    <div style={{ height: '100%', width: '100%' }}>
      <Editor
        height="100%"
        language={language}
        theme="vs-dark"
        onMount={handleEditorDidMount}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: 'on',
          roundedSelection: false,
          scrollBeyondLastLine: false,
          automaticLayout: true,
        }}
      />
    </div>
  );
}
