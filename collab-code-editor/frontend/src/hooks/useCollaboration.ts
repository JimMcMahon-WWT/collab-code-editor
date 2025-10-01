import { useEffect, useState } from 'react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';

export function useCollaboration(roomName: string) {
  const [ydoc] = useState(() => new Y.Doc());
  const [provider, setProvider] = useState<WebsocketProvider | null>(null);
  const [synced, setSynced] = useState(false);

  useEffect(() => {
    // Connect to Yjs WebSocket server
    const wsProvider = new WebsocketProvider(
      'ws://localhost:3001',
      roomName,
      ydoc,
      { 
        connect: true,
        // Use /yjs path for Yjs WebSocket
        params: { room: roomName }
      }
    );

    wsProvider.on('sync', (isSynced: boolean) => {
      setSynced(isSynced);
      if (isSynced) {
        console.log('✅ Yjs synchronized');
      }
    });

    wsProvider.on('status', ({ status }: { status: string }) => {
      console.log('Yjs connection status:', status);
    });

    setProvider(wsProvider);

    return () => {
      wsProvider.destroy();
    };
  }, [roomName, ydoc]);

  return { ydoc, provider, synced };
}
