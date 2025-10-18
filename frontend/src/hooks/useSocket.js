import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || window.location.origin;

let socket = null;

export function useSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [bots, setBots] = useState([]);

  useEffect(() => {
    // Vytvořit socket spojení pokud neexistuje
    if (!socket) {
      socket = io(SOCKET_URL, {
        transports: ['websocket', 'polling'],
      });

      socket.on('connect', () => {
        console.log('🔌 WebSocket připojen');
        setIsConnected(true);
      });

      socket.on('disconnect', () => {
        console.log('❌ WebSocket odpojen');
        setIsConnected(false);
      });
    }

    // Handler pro aktuální komponentu
    const handleBotsUpdate = (data) => {
      console.log('📥 Přijato:', data.length, 'botů');
      setBots(data);
    };

    // Přidat listener pro tuto komponentu
    socket.on('bots:update', handleBotsUpdate);

    // Nastavit aktuální connection status
    setIsConnected(socket.connected);

    return () => {
      // Odebrat listener této komponenty při unmount
      socket.off('bots:update', handleBotsUpdate);
    };
  }, []);

  return {
    socket,
    isConnected,
    bots,
  };
}
