import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || window.location.origin;

let socket = null;

export function useSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [bots, setBots] = useState([]);

  useEffect(() => {
    // Vytvořit socket spojení
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

      socket.on('bots:update', (data) => {
        setBots(data);
      });
    }

    return () => {
      // Neodpojovat socket při unmount - sdílíme ho napříč komponentami
    };
  }, []);

  return {
    socket,
    isConnected,
    bots,
  };
}
